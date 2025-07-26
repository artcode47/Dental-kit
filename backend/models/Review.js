const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  images: [{
    public_id: String,
    url: String,
  }],
  // Moderation
  isApproved: {
    type: Boolean,
    default: false,
  },
  isModerated: {
    type: Boolean,
    default: false,
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: Date,
  moderationNotes: String,
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
  // Flags
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: String,
  flaggedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  // Verification
  isVerifiedPurchase: {
    type: Boolean,
    default: true,
  },
  // Response from vendor/seller
  vendorResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
}, { timestamps: true });

// Ensure one review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Update product rating when review is saved
reviewSchema.post('save', async function(doc) {
  if (doc.isApproved) {
    await updateProductRating(doc.product);
  }
});

// Update product rating when review is updated
reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.isApproved) {
    await updateProductRating(doc.product);
  }
});

// Update product rating when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateProductRating(doc.product);
  }
});

async function updateProductRating(productId) {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = stats[0].ratingDistribution.filter(r => r === i).length;
    }

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution: ratingDistribution,
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema); 