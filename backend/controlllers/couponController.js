const CouponService = require('../services/couponService');
const UserService = require('../services/userService');
const OrderService = require('../services/orderService');

const couponService = new CouponService();
const userService = new UserService();
const orderService = new OrderService();

// Validate and apply coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    const coupon = await couponService.getCouponByCode(code.toUpperCase());
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!couponService.isValid(coupon)) {
      return res.status(400).json({ message: 'Coupon has expired or is no longer valid' });
    }

    if (!couponService.canUserUse(coupon, req.user.id, orderAmount)) {
      return res.status(400).json({ message: 'Coupon cannot be applied to this order' });
    }

    const discountAmount = couponService.calculateDiscount(coupon, orderAmount);
    const finalAmount = orderAmount - discountAmount;

    res.json({
      coupon: {
        id: coupon.id,
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

    const coupon = await couponService.getCouponByCode(code.toUpperCase());
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const order = await orderService.getById(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!couponService.isValid(coupon)) {
      return res.status(400).json({ message: 'Coupon has expired or is no longer valid' });
    }

    if (!couponService.canUserUse(coupon, req.user.id, order.subtotal)) {
      return res.status(400).json({ message: 'Coupon cannot be applied to this order' });
    }

    const discountAmount = couponService.calculateDiscount(coupon, order.subtotal);
    
    // Update order with discount
    const updatedOrder = await orderService.update(orderId, {
      discount: discountAmount,
      total: order.subtotal + order.tax + order.shipping - discountAmount
    });

    // Apply coupon usage
    await couponService.applyCoupon(coupon.id, req.user.id, orderId, discountAmount);

    res.json({
      message: 'Coupon applied successfully',
      order: updatedOrder,
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

    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (isPublic !== undefined) {
      filters.isPublic = isPublic === 'true';
    }

    const coupons = await couponService.getAll({
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = coupons.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCoupons = coupons.slice(startIndex, endIndex);

    res.json({
      coupons: paginatedCoupons,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

// Get single coupon
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await couponService.getById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon', error: error.message });
  }
};

// Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isPublic,
      isActive,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await couponService.getCouponByCode(code.toUpperCase());
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const couponData = {
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount: maximumDiscountAmount || 0,
      usageLimit: usageLimit || 0,
      userUsageLimit: userUsageLimit || 1,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isPublic: isPublic !== undefined ? isPublic : true,
      isActive: isActive !== undefined ? isActive : true,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || [],
      excludedCategories: excludedCategories || [],
      usageCount: 0,
      totalDiscountGiven: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const coupon = await couponService.create(couponData);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const coupon = await couponService.getById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // If code is being updated, check if it already exists
    if (updateData.code && updateData.code !== coupon.code) {
      const existingCoupon = await couponService.getCouponByCode(updateData.code.toUpperCase());
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    const updatedCoupon = await couponService.update(id, updateData);
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await couponService.getById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await couponService.delete(id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

// Toggle coupon status
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await couponService.getById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const updatedCoupon = await couponService.update(id, {
      isActive: !coupon.isActive
    });

    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling coupon status', error: error.message });
  }
};

// Get coupon usage statistics
exports.getCouponStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await couponService.getById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const stats = await couponService.getCouponStats(id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon stats', error: error.message });
  }
};

// Generate unique coupon code
exports.generateCouponCode = async (req, res) => {
  try {
    const code = await couponService.generateUniqueCode();
    res.json({ code });
  } catch (error) {
    res.status(500).json({ message: 'Error generating coupon code', error: error.message });
  }
}; 