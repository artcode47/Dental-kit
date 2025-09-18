const FirebaseService = require('./firebaseService');

class WishlistService extends FirebaseService {
  constructor() {
    super('wishlists');
  }

  // Get or create wishlist for user
  async getOrCreateWishlist(userId) {
    try {
      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let wishlist = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId === userId) {
          wishlist = {
            id: doc.id,
            ...this.convertTimestamps(data)
          };
        }
      });
      
      if (!wishlist) {
        wishlist = await this.create({
          userId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return wishlist;
    } catch (error) {
      throw new Error(`Error getting or creating wishlist: ${error.message}`);
    }
  }

  // Add item to wishlist
  async addToWishlist(userId, productId, options = {}) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      
      // Check if item already exists in wishlist
      const existingItem = wishlist.items.find(item => item.productId === productId);
      
      if (existingItem) {
        throw new Error('Product already in wishlist');
      }

      // Add new item
      const wishlistItem = {
        productId,
        addedAt: new Date(),
        ...options
      };

      wishlist.items.push(wishlistItem);
      
      await this.update(wishlist.id, {
        items: wishlist.items,
        updatedAt: new Date()
      });
      
      return await this.getById(wishlist.id);
    } catch (error) {
      throw new Error(`Error adding item to wishlist: ${error.message}`);
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(userId, productId) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      
      const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in wishlist');
      }
      
      wishlist.items.splice(itemIndex, 1);
      
      await this.update(wishlist.id, {
        items: wishlist.items,
        updatedAt: new Date()
      });
      
      return await this.getById(wishlist.id);
    } catch (error) {
      throw new Error(`Error removing item from wishlist: ${error.message}`);
    }
  }

  // Clear wishlist
  async clearWishlist(userId) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      
      await this.update(wishlist.id, {
        items: [],
        updatedAt: new Date()
      });
      
      return await this.getById(wishlist.id);
    } catch (error) {
      throw new Error(`Error clearing wishlist: ${error.message}`);
    }
  }

  // Get wishlist with product details
  async getWishlistWithProducts(userId) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      
      // Note: In a real implementation, you would populate product details here
      // For now, we'll return the wishlist as is
      return wishlist;
    } catch (error) {
      throw new Error(`Error getting wishlist with products: ${error.message}`);
    }
  }

  // Check if product is in wishlist
  async isInWishlist(userId, productId) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      return wishlist.items.some(item => item.productId === productId);
    } catch (error) {
      throw new Error(`Error checking wishlist status: ${error.message}`);
    }
  }

  // Get wishlist item count
  async getWishlistItemCount(userId) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      return wishlist.items.length;
    } catch (error) {
      throw new Error(`Error getting wishlist item count: ${error.message}`);
    }
  }

  // Move wishlist item to cart
  async moveToCart(userId, productId, cartService) {
    try {
      const wishlist = await this.getOrCreateWishlist(userId);
      const item = wishlist.items.find(item => item.productId === productId);
      
      if (!item) {
        throw new Error('Item not found in wishlist');
      }

      // Add to cart
      await cartService.addToCart(userId, productId, 1, {
        price: item.price,
        name: item.name,
        image: item.image
      });

      // Remove from wishlist
      await this.removeFromWishlist(userId, productId);
      
      return { message: 'Item moved to cart successfully' };
    } catch (error) {
      throw new Error(`Error moving item to cart: ${error.message}`);
    }
  }

  // Get wishlists by user (for admin purposes)
  async getWishlistsByUser(userId) {
    try {
      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      const wishlists = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId === userId) {
          wishlists.push({
            id: doc.id,
            ...this.convertTimestamps(data)
          });
        }
      });

      return wishlists;
    } catch (error) {
      throw new Error(`Error getting wishlists by user: ${error.message}`);
    }
  }

  // Get all wishlists (for admin purposes)
  async getAllWishlists(options = {}) {
    try {
      return await this.getAll(options);
    } catch (error) {
      throw new Error(`Error getting all wishlists: ${error.message}`);
    }
  }
}

module.exports = WishlistService;

