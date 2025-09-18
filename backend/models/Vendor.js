const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameAr: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  logo: {
    public_id: String,
    url: String,
  },
  description: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String,
  },
  paymentTerms: {
    type: String,
    default: 'Net 30',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalProducts: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
}, { timestamps: true });

// Create slug from name before saving
vendorSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema); 