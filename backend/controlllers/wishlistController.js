const WishlistService = require('../services/wishlistService');
const ProductService = require('../services/productService');

const wishlistService = new WishlistService();
const productService = new ProductService();

// Get user's wishlist (enriched with product details)
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.getOrCreateWishlist(req.user.id);

    const enrichItem = async (item) => {
      try {
        const product = await productService.getProductById(item.productId);
        if (!product || product.isActive === false) return null;
        // Normalize images to objects with url for frontend
        const images = Array.isArray(product.images)
          ? product.images.map(img => (typeof img === 'string' ? { url: img } : img))
          : [];
        return { ...item, product: { ...product, images } };
      } catch (_) {
        return null;
      }
    };

    const enriched = await Promise.all((wishlist.items || []).map(enrichItem));
    const filtered = enriched.filter(Boolean);

    if ((wishlist.items || []).length !== filtered.length) {
      await wishlistService.update(wishlist.id, { items: filtered.map(({ product, ...rest }) => rest) });
    }

    res.json({ ...wishlist, items: filtered });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, notes } = req.body;

    // Validate product exists and is active
    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Add product to wishlist
    const wishlist = await wishlistService.addToWishlist(req.user.id, productId, {
      notes,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      sku: product.sku
    });

    res.json(wishlist);
  } catch (error) {
    if (error.message.includes('already in wishlist')) {
      return res.status(400).json({ message: 'Product is already in your wishlist' });
    }
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await wishlistService.removeFromWishlist(req.user.id, productId);
    res.json(wishlist);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.clearWishlist(req.user.id);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error clearing wishlist', error: error.message });
  }
};

// Move item from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Get wishlist item details
    const wishlist = await wishlistService.getOrCreateWishlist(req.user.id);
    const item = wishlist.items.find(item => item.productId === productId);
    
    if (!item) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    // Add to cart (you'll need to import CartService here)
    // const cartService = new CartService();
    // await cartService.addToCart(req.user.id, productId, quantity, {
    //   price: item.price,
    //   name: item.name,
    //   image: item.image
    // });

    // Remove from wishlist
    await wishlistService.removeFromWishlist(req.user.id, productId);

    res.json({ message: 'Item moved to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error moving item to cart', error: error.message });
  }
};

// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const isInWishlist = await wishlistService.isInWishlist(req.user.id, productId);
    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error checking wishlist status', error: error.message });
  }
};

// Get wishlist count
exports.getWishlistCount = async (req, res) => {
  try {
    const count = await wishlistService.getWishlistItemCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting wishlist count', error: error.message });
  }
};

// Toggle wishlist item (add if missing, remove if exists)
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const isInWishlist = await wishlistService.isInWishlist(req.user.id, productId);
    let action = 'added';
    let wishlist;

    if (isInWishlist) {
      wishlist = await wishlistService.removeFromWishlist(req.user.id, productId);
      action = 'removed';
    } else {
      // Fetch product to enrich wishlist entry
      const product = await productService.getProductById(productId);
      if (!product || product.isActive === false) {
        return res.status(404).json({ message: 'Product not available' });
      }
      wishlist = await wishlistService.addToWishlist(req.user.id, productId, {
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]) : '',
        sku: product.sku
      });
    }

    // Enrich items for response
    const items = await Promise.all((wishlist.items || []).map(async (it) => {
      try {
        const product = await productService.getProductById(it.productId);
        if (!product) return null;
        const images = Array.isArray(product.images)
          ? product.images.map(img => (typeof img === 'string' ? { url: img } : img))
          : [];
        return { ...it, product: { ...product, images } };
      } catch { return null; }
    }));

    res.json({
      action,
      inWishlist: action === 'added',
      wishlist: { ...wishlist, items: items.filter(Boolean) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling wishlist', error: error.message });
  }
};

// Get wishlist with product details (for admin)
exports.getWishlistWithProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await wishlistService.getWishlistWithProducts(userId);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist with products', error: error.message });
  }
};

// Get all wishlists (for admin)
exports.getAllWishlists = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const wishlists = await wishlistService.getAllWishlists({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = wishlists.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedWishlists = wishlists.slice(startIndex, endIndex);

    res.json({
      wishlists: paginatedWishlists,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlists', error: error.message });
  }
}; 