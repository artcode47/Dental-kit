const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  nameAr: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    public_id: String,
    url: String,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.model('Category', categorySchema); 