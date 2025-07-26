const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['physical', 'digital'],
    default: 'digital',
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active',
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  issuedToEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  expiresAt: {
    type: Date,
  },
  usedAt: Date,
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  usageHistory: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    amount: {
      type: Number,
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

// Generate unique gift card code
giftCardSchema.pre('save', async function(next) {
  if (!this.isModified('code')) return next();
  
  if (!this.code) {
    this.code = await generateUniqueCode();
  }
  next();
});

// Update balance when used
giftCardSchema.methods.useCard = async function(amount, orderId, userId) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  if (this.status !== 'active') {
    throw new Error('Gift card is not active');
  }
  
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'expired';
    await this.save();
    throw new Error('Gift card has expired');
  }
  
  this.balance -= amount;
  this.usageHistory.push({
    order: orderId,
    amount,
    usedAt: new Date(),
  });
  
  if (this.balance === 0) {
    this.status = 'used';
    this.usedAt = new Date();
    this.usedBy = userId;
  }
  
  await this.save();
  return this;
};

// Generate unique gift card code
async function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existingCard = await mongoose.model('GiftCard').findOne({ code });
    if (!existingCard) {
      isUnique = true;
    }
  }
  
  return code;
}

// Index for efficient queries
giftCardSchema.index({ code: 1 });
giftCardSchema.index({ status: 1 });
giftCardSchema.index({ issuedBy: 1 });
giftCardSchema.index({ issuedTo: 1 });
giftCardSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('GiftCard', giftCardSchema); 