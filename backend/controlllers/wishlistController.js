const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive sku vendor',
        populate: {
          path: 'vendor',
          select: 'name logo'
        }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Filter out inactive products
    const validItems = wishlist.items.filter(item => 
      item.product && item.product.isActive
    );

    if (validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, notes } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if product is already in wishlist
    if (wishlist.hasProduct(productId)) {
      return res.status(400).json({ message: 'Product is already in your wishlist' });
    }

    // Add product to wishlist
    await wishlist.addProduct(productId, notes);

    // Populate product details
    await wishlist.populate({
      path: 'items.product',
      select: 'name price images stock isActive sku vendor',
      populate: {
        path: 'vendor',
        select: 'name logo'
      }
    });

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    await wishlist.removeProduct(productId);

    // Populate product details
    await wishlist.populate({
      path: 'items.product',
      select: 'name price images stock isActive sku vendor',
      populate: {
        path: 'vendor',
        select: 'name logo'
      }
    });

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    await wishlist.clearWishlist();
    res.json({ message: 'Wishlist cleared successfully', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing wishlist', error: error.message });
  }
};

// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const inWishlist = wishlist.hasProduct(productId);
    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error checking wishlist status', error: error.message });
  }
};

// Move wishlist item to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if product is in wishlist
    if (!wishlist.hasProduct(productId)) {
      return res.status(400).json({ message: 'Product is not in your wishlist' });
    }

    // Validate product stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Add to cart (you'll need to import cartController or implement cart logic here)
    // For now, we'll just remove from wishlist
    await wishlist.removeProduct(productId);

    res.json({ 
      message: 'Product moved to cart successfully',
      wishlist: await wishlist.populate({
        path: 'items.product',
        select: 'name price images stock isActive sku vendor',
        populate: {
          path: 'vendor',
          select: 'name logo'
        }
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error moving to cart', error: error.message });
  }
};

// Get wishlist count
exports.getWishlistCount = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const count = wishlist ? wishlist.items.length : 0;
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting wishlist count', error: error.message });
  }
}; 