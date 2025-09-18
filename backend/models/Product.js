const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameAr: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  images: [{
    public_id: String,
    url: String,
    alt: String,
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  specifications: {
    type: Map,
    of: String,
  },
  features: [String],
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  salePercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  tags: [String],
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  totalSold: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  // Search and discovery
  searchIndex: {
    type: String,
    index: true,
  },
  searchKeywords: [{
    type: String,
    trim: true,
  }],
  // Product variants
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    options: [{
      value: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        min: 0,
      },
      stock: {
        type: Number,
        default: 0,
        min: 0,
      },
      sku: {
        type: String,
        trim: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
  }],
  // Bundle products
  isBundle: {
    type: Boolean,
    default: false,
  },
  bundleItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
  }],
  bundleDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  // SEO and marketing
  metaTitle: {
    type: String,
    trim: true,
    maxlength: 60,
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  canonicalUrl: {
    type: String,
    trim: true,
  },
  // Social sharing
  socialImage: {
    public_id: String,
    url: String,
  },
  // Product relationships
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  upSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, { timestamps: true });

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `DENTAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema); 