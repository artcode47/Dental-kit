const mongoose = require('mongoose');

const productComparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  maxProducts: {
    type: Number,
    default: 4,
    min: 2,
    max: 10,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  lastViewed: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Generate share token for public comparisons
productComparisonSchema.pre('save', async function(next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = await generateShareToken();
  }
  next();
});

// Add product to comparison
productComparisonSchema.methods.addProduct = async function(productId) {
  // Check if product already exists
  const existingProduct = this.products.find(p => p.product.toString() === productId.toString());
  if (existingProduct) {
    throw new Error('Product already in comparison');
  }

  // Check if max products limit reached
  if (this.products.length >= this.maxProducts) {
    throw new Error(`Maximum ${this.maxProducts} products allowed in comparison`);
  }

  // Check if product exists and is active
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new Error('Product not found or not available');
  }

  this.products.push({ product: productId });
  await this.save();
  return this;
};

// Remove product from comparison
productComparisonSchema.methods.removeProduct = async function(productId) {
  this.products = this.products.filter(p => p.product.toString() !== productId.toString());
  await this.save();
  return this;
};

// Clear all products
productComparisonSchema.methods.clearProducts = async function() {
  this.products = [];
  await this.save();
  return this;
};

// Update last viewed timestamp
productComparisonSchema.methods.updateLastViewed = async function() {
  this.lastViewed = new Date();
  await this.save();
  return this;
};

// Generate unique share token
async function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token;
  let isUnique = false;
  
  while (!isUnique) {
    token = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) token += '-';
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existingComparison = await mongoose.model('ProductComparison').findOne({ shareToken: token });
    if (!existingComparison) {
      isUnique = true;
    }
  }
  
  return token;
}

// Index for efficient queries
productComparisonSchema.index({ user: 1 });
// ShareToken field already has unique: true which creates an index
productComparisonSchema.index({ isPublic: 1 });
productComparisonSchema.index({ lastViewed: -1 });

module.exports = mongoose.model('ProductComparison', productComparisonSchema); 