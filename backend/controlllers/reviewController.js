const ReviewService = require('../services/reviewService');
const ProductService = require('../services/productService');
const OrderService = require('../services/orderService');
const { uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');
const { uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');

const reviewService = new ReviewService();
const productService = new ProductService();
const orderService = new OrderService();

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = { productId, isApproved: true };
    if (rating) {
      filters.rating = parseInt(rating);
    }

    const result = await reviewService.getReviews({
      productId,
      rating,
      isApproved: true,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Get all reviews for rating distribution (without pagination)
    const allReviewsResult = await reviewService.getReviews({
      productId,
      isApproved: true,
      page: 1,
      limit: 1000  // Get all reviews for distribution calculation
    });

    // Get rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      const stat = allReviewsResult.reviews.filter(review => review.rating === i);
      ratingDistribution[i] = stat.length;
    }

    res.json({
      reviews: result.reviews,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;

    // Verify user has purchased the product
    const order = await orderService.getById(orderId);
    if (!order || order.userId !== req.user.id || order.status !== 'delivered') {
      return res.status(400).json({ message: 'You can only review products you have purchased and received' });
    }

    // Check if order contains the product
    const orderItem = order.items.find(item => item.productId === productId);
    if (!orderItem) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    // Check if user already reviewed this product for this order
    const existingReview = await reviewService.findOneBy('orderId', orderId);
    if (existingReview && existingReview.productId === productId && existingReview.userId === req.user.id) {
      return res.status(400).json({ message: 'You have already reviewed this product for this order' });
    }

    const reviewData = {
      userId: req.user.id,
      productId,
      orderId,
      rating,
      title,
      comment,
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      const imageResults = await uploadMultipleImages(req.files, 'reviews');
      reviewData.images = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url
      }));
    }

    const review = await reviewService.create(reviewData);
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

    const review = await reviewService.getById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;

    // Handle new image uploads if provided
    if (req.files && req.files.length > 0) {
      const imageResults = await uploadMultipleImages(req.files, 'reviews');
      const newImages = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url
      }));
      
      // Combine with existing images
      const existingImages = review.images || [];
      updateData.images = [...existingImages, ...newImages];
    }

    const updatedReview = await reviewService.update(reviewId, updateData);
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewService.getById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    // Delete images from Cloudinary if they exist
    if (review.images && review.images.length > 0) {
      const publicIds = review.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }

    await reviewService.delete(reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// Delete review image
exports.deleteReviewImage = async (req, res) => {
  try {
    const { reviewId, imageId } = req.params;

    const review = await reviewService.getById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete images from your own reviews' });
    }

    const image = review.images.find(img => img.public_id === imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await deleteMultipleImages([image.public_id]);

    // Remove from review
    const updatedImages = review.images.filter(img => img.public_id !== imageId);
    await reviewService.update(reviewId, { images: updatedImages });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

// Get user reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await reviewService.getAll({
      filters: { userId: req.user.id },
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = reviews.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
};

// Admin: Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, rating, productId } = req.query;
    
    const filters = {};
    if (status) filters.isApproved = status === 'approved';
    if (rating) filters.rating = parseInt(rating);
    if (productId) filters.productId = productId;

    const reviews = await reviewService.getAll({
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = reviews.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Admin: Approve/Reject review
exports.approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved, adminNotes } = req.body;

    const review = await reviewService.getById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updateData = {
      isApproved,
      adminNotes,
      approvedBy: req.user.id,
      approvedAt: new Date()
    };

    const updatedReview = await reviewService.update(reviewId, updateData);
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error approving review', error: error.message });
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
        return res.status(400).json({ message: 'No images provided' });
      }

      const imageResults = await uploadMultipleImages(req.files, 'reviews');
      res.json(imageResults);
    } catch (error) {
      res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
  }
]; 