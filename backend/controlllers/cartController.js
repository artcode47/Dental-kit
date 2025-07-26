const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive sku vendor',
        populate: {
          path: 'vendor',
          select: 'name logo'
        }
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if products are still available and active
    const validItems = [];
    for (const item of cart.items) {
      if (item.product && item.product.isActive && item.product.stock > 0) {
        // Update price if it changed
        if (item.price !== item.product.price) {
          item.price = item.product.price;
        }
        validItems.push(item);
      }
    }

    // Remove invalid items
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId)
      .populate('vendor', 'name logo');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive sku vendor',
      populate: {
        path: 'vendor',
        select: 'name logo'
      }
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update quantity
    await cart.updateQuantity(productId, quantity);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive sku vendor',
      populate: {
        path: 'vendor',
        select: 'name logo'
      }
    });

    res.json(cart);
  } catch (error) {
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.removeItem(productId);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive sku vendor',
      populate: {
        path: 'vendor',
        select: 'name logo'
      }
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.clearCart();
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Get cart summary (for checkout)
exports.getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive sku vendor',
        populate: {
          path: 'vendor',
          select: 'name logo'
        }
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate all items
    const validItems = [];
    const invalidItems = [];

    for (const item of cart.items) {
      if (item.product && item.product.isActive && item.product.stock >= item.quantity) {
        validItems.push(item);
      } else {
        invalidItems.push({
          productId: item.product?._id,
          name: item.product?.name,
          reason: !item.product ? 'Product not found' : 
                  !item.product.isActive ? 'Product not available' : 
                  'Insufficient stock'
        });
      }
    }

    if (invalidItems.length > 0) {
      return res.status(400).json({
        message: 'Some items in your cart are no longer available',
        invalidItems,
        validItems
      });
    }

    const summary = {
      itemCount: cart.itemCount,
      subtotal: cart.total,
      tax: 0, // Calculate based on your tax rules
      shipping: 0, // Calculate based on shipping method
      total: cart.total,
      items: validItems
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error getting cart summary', error: error.message });
  }
}; 