const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshTokens: [String],
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  sessions: [
    {
      sessionId: String,
      userAgent: String,
      ip: String,
      createdAt: Date,
      lastUsed: Date,
      isRevoked: { type: Boolean, default: false },
    }
  ],
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: String,
  mfaBackupCodes: [String],
  mfaEmailOTP: String,
  mfaEmailOTPExpires: Date,
  securityQuestions: [
    {
      question: String,
      answerHash: String,
    }
  ],
  consentGiven: { type: Boolean, default: false },
  consentTimestamp: Date,
  anonymized: { type: Boolean, default: false },
  emailPreferences: {
    marketing: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    updates: { type: Boolean, default: true },
  },
  language: { type: String, default: 'en' },
  // Profile Information
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing', 'both'],
      default: 'both',
    },
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
    isDefault: {
      type: Boolean,
      default: false,
    },
  }],
  // Preferences
  preferences: {
    newsletter: { type: Boolean, default: true },
    marketing: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    productRecommendations: { type: Boolean, default: true },
  },
  // E-commerce specific
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date,
  // Recently viewed products
  recentlyViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Search history
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  // Loyalty points
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  loyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  },
  // Referral system
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  referralEarnings: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 