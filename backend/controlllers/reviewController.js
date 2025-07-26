const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');
const { uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { product: productId, isApproved: true };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName')
      .populate('vendorResponse.respondedBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      const stat = ratingStats.find(s => s._id === i);
      ratingDistribution[i] = stat ? stat.count : 0;
    }

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      ratingDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;

    // Verify user has purchased the product
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'delivered',
      'items.product': productId
    });

    if (!order) {
      return res.status(400).json({ message: 'You can only review products you have purchased and received' });
    }

    // Check if user already reviewed this product for this order
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product for this order' });
    }

    const reviewData = {
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment
    };

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      const imageResults = await uploadMultipleImages(req.files, 'reviews');
      reviewData.images = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url,
      }));
    }

    const review = await Review.create(reviewData);

    // Auto-approve reviews (you can change this to require moderation)
    review.isApproved = true;
    review.isModerated = true;
    await review.save();

    await review.populate('user', 'firstName lastName');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.isModerated) {
      return res.status(400).json({ message: 'Cannot update moderated review' });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imageResults = await uploadMultipleImages(req.files, 'reviews');
      const newImages = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url,
      }));

      updateData.images = [...review.images, ...newImages];
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName');

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete images from Cloudinary
    if (review.images && review.images.length > 0) {
      const publicIds = review.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }

    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// Vote review as helpful
exports.voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (isHelpful) {
      review.helpfulVotes += 1;
    }
    review.totalVotes += 1;

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error voting on review', error: error.message });
  }
};

// Flag review
exports.flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already flagged this review
    const alreadyFlagged = review.flaggedBy.some(flag => 
      flag.user.toString() === req.user._id.toString()
    );

    if (alreadyFlagged) {
      return res.status(400).json({ message: 'You have already flagged this review' });
    }

    review.flaggedBy.push({
      user: req.user._id,
      reason
    });

    if (review.flaggedBy.length >= 3) {
      review.isFlagged = true;
      review.flagReason = 'Multiple user flags';
    }

    await review.save();
    res.json({ message: 'Review flagged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error flagging review', error: error.message });
  }
};

// Vendor response to review
exports.addVendorResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if vendor already responded
    if (review.vendorResponse && review.vendorResponse.comment) {
      return res.status(400).json({ message: 'Vendor has already responded to this review' });
    }

    review.vendorResponse = {
      comment,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };

    await review.save();
    await review.populate('vendorResponse.respondedBy', 'firstName lastName');

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding vendor response', error: error.message });
  }
};

// Admin: Get all reviews for moderation
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, rating, productId } = req.query;

    const query = {};
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'flagged') query.isFlagged = true;
    if (rating) query.rating = parseInt(rating);
    if (productId) query.product = productId;

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name images')
      .populate('order', 'orderNumber')
      .populate('vendorResponse.respondedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Admin: Moderate review
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved, moderationNotes } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = isApproved;
    review.isModerated = true;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    review.moderationNotes = moderationNotes;

    await review.save();
    await review.populate('user', 'firstName lastName');

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error moderating review', error: error.message });
  }
};

// Upload review images
exports.uploadReviewImages = [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }

      const imageResults = await uploadMultipleImages(req.files, 'reviews');
      const images = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url,
      }));

      res.json({ images });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
  }
]; 