const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Discount type and amount
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'free_shipping'],
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  // Usage limits
  maxUses: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  maxUsesPerUser: {
    type: Number,
    default: 1,
  },
  // Date restrictions
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  // Minimum requirements
  minimumOrderAmount: {
    type: Number,
    default: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    default: null, // null means no limit
  },
  // Product/Category restrictions
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  // User restrictions
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  userGroups: [{
    type: String,
    enum: ['new_users', 'returning_customers', 'vip_customers', 'all'],
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublic: {
    type: Boolean,
    default: true, // false means admin-generated only
  },
  // Usage tracking
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    discountAmount: Number,
    usedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Analytics
  totalDiscountGiven: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Index for efficient queries
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1, validUntil: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.maxUses === null || this.usedCount < this.maxUses)
  );
};

// Method to check if user can use coupon
couponSchema.methods.canUserUse = function(userId, orderAmount = 0) {
  if (!this.isValid()) return false;
  
  // Check minimum order amount
  if (orderAmount < this.minimumOrderAmount) return false;
  
  // Check user restrictions
  if (this.applicableUsers.length > 0 && !this.applicableUsers.includes(userId)) {
    return false;
  }
  
  // Check usage per user
  const userUsageCount = this.usageHistory.filter(usage => 
    usage.user.toString() === userId.toString()
  ).length;
  
  return userUsageCount < this.maxUsesPerUser;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (this.discountType === 'percentage') {
    const discount = (orderAmount * this.discountValue) / 100;
    return this.maximumDiscountAmount ? Math.min(discount, this.maximumDiscountAmount) : discount;
  } else if (this.discountType === 'fixed') {
    return Math.min(this.discountValue, orderAmount);
  } else if (this.discountType === 'free_shipping') {
    return 0; // Will be handled separately in shipping calculation
  }
  return 0;
};

// Method to apply coupon
couponSchema.methods.applyCoupon = function(userId, orderId, discountAmount) {
  this.usedCount += 1;
  this.totalDiscountGiven += discountAmount;
  this.totalOrders += 1;
  
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount,
  });
  
  return this.save();
};

// Pre-save validation
couponSchema.pre('save', function(next) {
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid from date must be before valid until date'));
  }
  
  if (this.discountType === 'percentage' && (this.discountValue < 0 || this.discountValue > 100)) {
    return next(new Error('Percentage discount must be between 0 and 100'));
  }
  
  if (this.discountType === 'fixed' && this.discountValue < 0) {
    return next(new Error('Fixed discount amount must be positive'));
  }
  
  next();
});

module.exports = mongoose.model('Coupon', couponSchema); 