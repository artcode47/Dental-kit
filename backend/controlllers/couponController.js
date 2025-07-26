const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Order = require('../models/Order');

// Validate and apply coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon has expired or is no longer valid' });
    }

    if (!coupon.canUserUse(req.user._id, orderAmount)) {
      return res.status(400).json({ message: 'Coupon cannot be applied to this order' });
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    res.json({
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
      },
      discountAmount,
      finalAmount,
      orderAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
};

// Apply coupon to order
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon has expired or is no longer valid' });
    }

    if (!coupon.canUserUse(req.user._id, order.subtotal)) {
      return res.status(400).json({ message: 'Coupon cannot be applied to this order' });
    }

    const discountAmount = coupon.calculateDiscount(order.subtotal);
    
    // Update order with discount
    order.discount = discountAmount;
    order.total = order.subtotal + order.tax + order.shipping - discountAmount;
    await order.save();

    // Apply coupon usage
    await coupon.applyCoupon(req.user._id, orderId, discountAmount);

    res.json({
      message: 'Coupon applied successfully',
      order,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
};

// Get all coupons (admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, isPublic } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const coupons = await Coupon.find(query)
      .populate('applicableUsers', 'firstName lastName email')
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Coupon.countDocuments(query);

    res.json({
      coupons,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

// Get single coupon (admin)
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableUsers', 'firstName lastName email')
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name')
      .populate('usageHistory.user', 'firstName lastName email')
      .populate('usageHistory.order', 'orderNumber total');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon', error: error.message });
  }
};

// Create coupon (admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      maxUses,
      maxUsesPerUser,
      validFrom,
      validUntil,
      minimumOrderAmount,
      maximumDiscountAmount,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      applicableUsers,
      userGroups,
      isPublic
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const couponData = {
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      maxUses: maxUses || null,
      maxUsesPerUser: maxUsesPerUser || 1,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount: maximumDiscountAmount || null,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || [],
      excludedCategories: excludedCategories || [],
      applicableUsers: applicableUsers || [],
      userGroups: userGroups || ['all'],
      isPublic: isPublic !== undefined ? isPublic : true,
    };

    const coupon = await Coupon.create(couponData);

    await coupon.populate([
      { path: 'applicableUsers', select: 'firstName lastName email' },
      { path: 'applicableProducts', select: 'name sku' },
      { path: 'applicableCategories', select: 'name' }
    ]);

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

// Update coupon (admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating code if coupon has been used
    if (updateData.code) {
      const coupon = await Coupon.findById(id);
      if (coupon && coupon.usedCount > 0) {
        return res.status(400).json({ message: 'Cannot update code of a used coupon' });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Convert date strings to Date objects
    if (updateData.validFrom) updateData.validFrom = new Date(updateData.validFrom);
    if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'applicableUsers', select: 'firstName lastName email' },
      { path: 'applicableProducts', select: 'name sku' },
      { path: 'applicableCategories', select: 'name' }
    ]);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

// Delete coupon (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.usedCount > 0) {
      return res.status(400).json({ message: 'Cannot delete a coupon that has been used' });
    }

    await Coupon.findByIdAndDelete(id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

// Toggle coupon status (admin)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling coupon status', error: error.message });
  }
};

// Get coupon statistics (admin)
exports.getCouponStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage,
      totalDiscountGiven
    ] = await Promise.all([
      Coupon.countDocuments(query),
      Coupon.countDocuments({ ...query, isActive: true }),
      Coupon.countDocuments({ ...query, validUntil: { $lt: new Date() } }),
      Coupon.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$usedCount' } } }
      ]),
      Coupon.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalDiscountGiven' } } }
      ])
    ]);

    const stats = {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage: totalUsage[0]?.total || 0,
      totalDiscountGiven: totalDiscountGiven[0]?.total || 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon stats', error: error.message });
  }
};

// Generate coupon code
exports.generateCouponCode = async (req, res) => {
  try {
    const { prefix = 'DENTAL', length = 8 } = req.body;
    
    let code;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const randomPart = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
      code = `${prefix}${randomPart}`;
      attempts++;

      if (attempts > maxAttempts) {
        return res.status(500).json({ message: 'Unable to generate unique coupon code' });
      }
    } while (await Coupon.findOne({ code }));

    res.json({ code });
  } catch (error) {
    res.status(500).json({ message: 'Error generating coupon code', error: error.message });
  }
}; 