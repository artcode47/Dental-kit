const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  // Addresses
  shippingAddress: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
  },
  // Payment
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'cash_on_delivery', 'bank_transfer'],
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  paymentId: String,
  paymentDate: Date,
  // Shipping
  shippingMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'overnight', 'pickup'],
  },
  shippingStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  shippedAt: Date,
  deliveredAt: Date,
  // Order Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  // Notes
  customerNotes: String,
  adminNotes: String,
  // Timestamps
  confirmedAt: Date,
  processedAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
}, { timestamps: true });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `DENTAL-${year}${month}${day}-${random}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
  next();
});

// Update user stats after order completion
orderSchema.post('save', async function(doc) {
  if (doc.status === 'delivered' && doc.paymentStatus === 'paid') {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.user, {
      $inc: { totalOrders: 1, totalSpent: doc.total },
      lastOrderDate: new Date(),
    });
  }
});

module.exports = mongoose.model('Order', orderSchema); 