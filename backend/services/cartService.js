const FirebaseService = require('./firebaseService');
const unifiedStore = require('./unifiedStore');

class CartService extends FirebaseService {
  constructor() {
    super('carts');
    this.cacheTTL = 180; // 3 minutes for cart data
    this.userCartCacheTTL = 300; // 5 minutes for user cart
  }

  // Enhanced caching methods
  async getCacheKey(operation, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `cart:${operation}:${sortedParams}`;
  }

  async getFromCache(cacheKey) {
    try {
      return await unifiedStore.getCache(cacheKey);
    } catch (error) {
      console.warn('Cart cache read failed:', error.message);
      return null;
    }
  }

  async setCache(cacheKey, data, ttl = this.cacheTTL) {
    try {
      await unifiedStore.setCache(cacheKey, data, ttl);
    } catch (error) {
      console.warn('Cart cache write failed:', error.message);
    }
  }

  async invalidateUserCart(userId) {
    try {
      const patterns = [
        `cart:getOrCreateCart:${userId}`,
        `cart:getCartWithProducts:${userId}`,
        `cart:userCart:${userId}`
      ];
      
      for (const pattern of patterns) {
        await unifiedStore.deleteCache(pattern);
      }
    } catch (error) {
      console.warn('Cart cache invalidation failed:', error.message);
    }
  }

  // Get or create cart for user with caching
  async getOrCreateCart(userId) {
    try {
      const cacheKey = await this.getCacheKey('getOrCreateCart', { userId });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let cart = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId === userId) {
          cart = {
            id: doc.id,
            ...this.convertTimestamps(data)
          };
        }
      });
      
      if (!cart) {
        cart = await this.create({
          userId,
          items: [],
          total: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          couponCode: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Cache the cart
      await this.setCache(cacheKey, cart, this.userCartCacheTTL);
      
      return cart;
    } catch (error) {
      throw new Error(`Error getting or creating cart: ${error.message}`);
    }
  }

  // Get cart with products with caching
  async getCartWithProducts(userId) {
    try {
      const cacheKey = await this.getCacheKey('getCartWithProducts', { userId });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const cart = await this.getOrCreateCart(userId);
      
      if (!cart.items || cart.items.length === 0) {
        const emptyCart = { ...cart, items: [], total: 0, subtotal: 0 };
        await this.setCache(cacheKey, emptyCart, this.userCartCacheTTL);
        return emptyCart;
      }

      // Get product details for cart items
      const ProductService = require('./productService');
      const productService = new ProductService();
      
      const cartWithProducts = {
        ...cart,
        items: await Promise.all(
          cart.items.map(async (item) => {
            try {
              const product = await productService.getProductById(item.productId);
              if (product) {
                return {
                  ...item,
                  product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.images?.[0]?.url || product.image || '',
                    stock: product.stock,
                    isActive: product.isActive,
                    slug: product.slug
                  }
                };
              } else {
                // Product not found, mark as unavailable
                return {
                  ...item,
                  product: null,
                  unavailable: true
                };
              }
            } catch (error) {
              console.warn(`Error fetching product ${item.productId}:`, error.message);
              return {
                ...item,
                product: null,
                unavailable: true
              };
            }
          })
        )
      };

      // Recalculate totals
      await this.recalculateCartTotals(cartWithProducts.id);
      
      // Get updated cart with recalculated totals
      const updatedCart = await this.getById(cartWithProducts.id);
      const finalCart = {
        ...cartWithProducts,
        ...updatedCart
      };

      // Cache the result
      await this.setCache(cacheKey, finalCart, this.userCartCacheTTL);
      
      return finalCart;
    } catch (error) {
      throw new Error(`Error getting cart with products: ${error.message}`);
    }
  }

  // Add item to cart with cache invalidation
  async addToCart(userId, productId, quantity = 1, options = {}) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex > -1) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].updatedAt = new Date();
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          price: options.price || 0,
          name: options.name || '',
          image: options.image || '',
          addedAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Recalculate cart totals
      await this.recalculateCartTotals(cart.id);
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return await this.getById(cart.id);
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error.message}`);
    }
  }

  // Update cart item quantity with cache invalidation
  async updateCartItem(userId, productId, quantity) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].updatedAt = new Date();
      }
      
      // Recalculate cart totals
      await this.recalculateCartTotals(cart.id);
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return await this.getById(cart.id);
    } catch (error) {
      throw new Error(`Error updating cart item: ${error.message}`);
    }
  }

  // Remove item from cart with cache invalidation
  async removeFromCart(userId, productId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      // Remove item
      cart.items.splice(itemIndex, 1);
      
      // Recalculate cart totals
      await this.recalculateCartTotals(cart.id);
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return await this.getById(cart.id);
    } catch (error) {
      throw new Error(`Error removing item from cart: ${error.message}`);
    }
  }

  // Clear cart with cache invalidation
  async clearCart(userId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      // Clear items and reset totals
      cart.items = [];
      cart.subtotal = 0;
      cart.total = 0;
      cart.tax = 0;
      cart.shipping = 0;
      cart.discount = 0;
      cart.couponCode = null;
      cart.updatedAt = new Date();
      
      // Update cart in database
      await this.update(cart.id, {
        items: [],
        subtotal: 0,
        total: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        couponCode: null,
        updatedAt: new Date()
      });
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return cart;
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }

  // Apply coupon with cache invalidation
  async applyCoupon(userId, couponCode) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      // Validate coupon (implement your coupon validation logic here)
      const CouponService = require('./couponService');
      const couponService = new CouponService();
      
      const coupon = await couponService.validateCoupon(couponCode, cart.subtotal);
      if (!coupon) {
        throw new Error('Invalid or expired coupon');
      }
      
      // Apply coupon discount
      cart.couponCode = couponCode;
      cart.discount = coupon.discountAmount || 0;
      cart.updatedAt = new Date();
      
      // Recalculate cart totals
      await this.recalculateCartTotals(cart.id);
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return await this.getById(cart.id);
    } catch (error) {
      throw new Error(`Error applying coupon: ${error.message}`);
    }
  }

  // Remove coupon with cache invalidation
  async removeCoupon(userId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      // Remove coupon
      cart.couponCode = null;
      cart.discount = 0;
      cart.updatedAt = new Date();
      
      // Recalculate cart totals
      await this.recalculateCartTotals(cart.id);
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return await this.getById(cart.id);
    } catch (error) {
      throw new Error(`Error removing coupon: ${error.message}`);
    }
  }

  // Recalculate cart totals
  async recalculateCartTotals(cartId) {
    try {
      const cart = await this.getById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      let subtotal = 0;
      let totalItems = 0;
      
      // Calculate subtotal and total items
      cart.items.forEach(item => {
        if (item.price && item.quantity) {
          subtotal += item.price * item.quantity;
          totalItems += item.quantity;
        }
      });
      
      // Calculate tax (implement your tax calculation logic here)
      const taxRate = 0.1; // 10% tax rate - adjust as needed
      const tax = subtotal * taxRate;
      
      // Calculate shipping (implement your shipping calculation logic here)
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      
      // Calculate total
      const total = subtotal + tax + shipping - (cart.discount || 0);
      
      // Update cart with new totals
      await this.update(cartId, {
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        totalItems,
        updatedAt: new Date()
      });
      
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        totalItems
      };
    } catch (error) {
      throw new Error(`Error recalculating cart totals: ${error.message}`);
    }
  }

  // Get cart summary with caching
  async getCartSummary(userId) {
    try {
      const cacheKey = await this.getCacheKey('getCartSummary', { userId });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const cart = await this.getOrCreateCart(userId);
      
      const summary = {
        totalItems: cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        subtotal: cart.subtotal || 0,
        tax: cart.tax || 0,
        shipping: cart.shipping || 0,
        discount: cart.discount || 0,
        total: cart.total || 0,
        hasItems: cart.items && cart.items.length > 0,
        itemCount: cart.items ? cart.items.length : 0
      };
      
      // Cache the summary
      await this.setCache(cacheKey, summary, this.cacheTTL);
      
      return summary;
    } catch (error) {
      throw new Error(`Error getting cart summary: ${error.message}`);
    }
  }

  // Check if product is in cart
  async isProductInCart(userId, productId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      return cart.items.some(item => item.productId === productId);
    } catch (error) {
      console.warn('Error checking if product is in cart:', error.message);
      return false;
    }
  }

  // Get cart item quantity
  async getCartItemQuantity(userId, productId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      const item = cart.items.find(item => item.productId === productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.warn('Error getting cart item quantity:', error.message);
      return 0;
    }
  }

  // Merge guest cart with user cart
  async mergeGuestCart(userId, guestCartItems) {
    try {
      if (!guestCartItems || guestCartItems.length === 0) {
        return await this.getOrCreateCart(userId);
      }
      
      const userCart = await this.getOrCreateCart(userId);
      
      // Add guest cart items to user cart
      for (const guestItem of guestCartItems) {
        const existingItemIndex = userCart.items.findIndex(
          item => item.productId === guestItem.productId
        );
        
        if (existingItemIndex > -1) {
          // Update existing item quantity
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
          userCart.items[existingItemIndex].updatedAt = new Date();
        } else {
          // Add new item
          userCart.items.push({
            ...guestItem,
            addedAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      // Recalculate cart totals
      await this.recalculateCartTotals(userCart.id);
      
      // Invalidate user cart cache
      await this.invalidateUserCart(userId);
      
      return await this.getById(userCart.id);
    } catch (error) {
      throw new Error(`Error merging guest cart: ${error.message}`);
    }
  }

  // Clear all cart caches
  async clearAllCaches() {
    try {
      await unifiedStore.clearCache('cart:*');
      console.log('✅ All cart caches cleared');
    } catch (error) {
      console.error('❌ Error clearing cart caches:', error);
    }
  }
}

module.exports = CartService;
