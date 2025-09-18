const CartService = require('../services/cartService');
const ProductService = require('../services/productService');

const cartService = new CartService();
const productService = new ProductService();

// Get user cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartWithProducts(userId);
    res.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Get product details
    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = await cartService.addToCart(userId, productId, quantity, {
      price: product.price,
      name: product.name,
      image: product.images?.[0] || ''
    });

    res.json({ cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const cart = await cartService.updateCartItem(userId, productId, quantity);
    res.json({ cart });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(userId, productId);
    res.json({ cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.clearCart(userId);
    res.json({ cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const cart = await cartService.applyCoupon(userId, couponCode);
    res.json({ cart });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Error applying coupon' });
  }
};

// Remove coupon
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.removeCoupon(userId);
    res.json({ cart });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({ message: 'Error removing coupon' });
  }
};

// Get cart item count
exports.getCartItemCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await cartService.getCartItemCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Get cart item count error:', error);
    res.status(500).json({ message: 'Error getting cart item count' });
  }
};

// Merge guest cart
exports.mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guestCartItems } = req.body;

    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({ message: 'Guest cart items are required' });
    }

    const cart = await cartService.mergeGuestCart(userId, guestCartItems);
    res.json({ cart });
  } catch (error) {
    console.error('Merge guest cart error:', error);
    res.status(500).json({ message: 'Error merging guest cart' });
  }
}; 