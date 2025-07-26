const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Update lastUpdated when items change
wishlistSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId, notes = '') {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (!existingItem) {
    this.items.push({
      product: productId,
      notes,
    });
  }
  
  return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => item.product.toString() === productId.toString());
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Wishlist', wishlistSchema); 