const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// Create order from cart (checkout)
exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      customerNotes,
      useDefaultAddresses = true
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price stock isActive sku vendor',
        populate: {
          path: 'vendor',
          select: 'name'
        }
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate cart items
    const validItems = [];
    const invalidItems = [];

    for (const item of cart.items) {
      if (item.product && item.product.isActive && item.product.stock >= item.quantity) {
        validItems.push({
          product: item.product._id,
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          vendor: item.product.vendor._id
        });
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
        invalidItems
      });
    }

    // Get user for default addresses
    const user = await User.findById(req.user._id);
    let finalShippingAddress = shippingAddress;
    let finalBillingAddress = billingAddress;

    if (useDefaultAddresses) {
      const defaultShipping = user.addresses.find(addr => addr.isDefault && ['shipping', 'both'].includes(addr.type));
      const defaultBilling = user.addresses.find(addr => addr.isDefault && ['billing', 'both'].includes(addr.type));

      if (!finalShippingAddress && defaultShipping) {
        finalShippingAddress = defaultShipping;
      }
      if (!finalBillingAddress && defaultBilling) {
        finalBillingAddress = defaultBilling;
      }
    }

    if (!finalShippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!finalBillingAddress) {
      return res.status(400).json({ message: 'Billing address is required' });
    }

    // Calculate totals
    const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // Calculate based on your tax rules
    const shipping = 0; // Calculate based on shipping method
    const total = subtotal + tax + shipping;

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `DENTAL-${year}${month}${day}-${random}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: req.user._id,
      items: validItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: finalShippingAddress,
      billingAddress: finalBillingAddress,
      paymentMethod,
      shippingMethod,
      customerNotes,
      status: 'pending',
      paymentStatus: 'pending',
      shippingStatus: 'pending'
    });

    await order.save();

    // Update product stock
    for (const item of validItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await cart.clearCart();

    // Populate order details
    await order.populate([
      {
        path: 'items.product',
        select: 'name images sku'
      },
      {
        path: 'items.vendor',
        select: 'name logo'
      }
    ]);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      shippingStatus,
      search,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (shippingStatus) query.shippingStatus = shippingStatus;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images sku')
      .populate('items.vendor', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order (admin)
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images sku description')
      .populate('items.vendor', 'name logo');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, shippingStatus, adminNotes } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'confirmed') updateData.confirmedAt = new Date();
      if (status === 'processing') updateData.processedAt = new Date();
      if (status === 'cancelled') updateData.cancelledAt = new Date();
      if (status === 'refunded') updateData.refundedAt = new Date();
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') updateData.paymentDate = new Date();
    }

    if (shippingStatus) {
      updateData.shippingStatus = shippingStatus;
      if (shippingStatus === 'shipped') updateData.shippedAt = new Date();
      if (shippingStatus === 'delivered') updateData.deliveredAt = new Date();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'user',
        select: 'firstName lastName email phone'
      },
      {
        path: 'items.product',
        select: 'name images sku'
      },
      {
        path: 'items.vendor',
        select: 'name logo'
      }
    ]);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Add tracking information (admin)
exports.addTrackingInfo = async (req, res) => {
  try {
    const { trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    order.estimatedDelivery = estimatedDelivery;
    order.shippingStatus = 'shipped';
    order.shippedAt = new Date();

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error adding tracking info', error: error.message });
  }
};

// Get order statistics (admin)
exports.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue
    ] = await Promise.all([
      Order.countDocuments(query),
      Order.countDocuments({ ...query, status: 'pending' }),
      Order.countDocuments({ ...query, status: 'delivered' }),
      Order.countDocuments({ ...query, status: 'cancelled' }),
      Order.aggregate([
        { $match: { ...query, status: 'delivered', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { ...query, status: 'delivered', paymentStatus: 'paid' } },
        { $group: { _id: null, average: { $avg: '$total' } } }
      ])
    ]);

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageOrderValue: averageOrderValue[0]?.average || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order stats', error: error.message });
  }
}; 