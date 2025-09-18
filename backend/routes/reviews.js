const express = require('express');
const { body, param, query } = require('express-validator');
const reviewController = require('../controlllers/reviewController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.get('/product/:productId', [
  param('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, reviewController.getProductReviews);

// Authenticated routes
router.use(auth);

// Create review
router.post('/', [
  body('productId').notEmpty().withMessage('Valid product ID is required'),
  body('orderId').notEmpty().withMessage('Valid order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().trim(),
], validate, reviewController.createReview);

// Update review
router.put('/:reviewId', [
  param('reviewId').notEmpty().withMessage('Valid review ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().trim(),
], validate, reviewController.updateReview);

// Delete review
router.delete('/:reviewId', [
  param('reviewId').notEmpty().withMessage('Valid review ID is required'),
], validate, reviewController.deleteReview);

// Approve review (admin)
router.patch('/:reviewId/approve', [
  param('reviewId').notEmpty().withMessage('Valid review ID is required'),
], validate, adminAuth, reviewController.approveReview);

// Delete review image
router.delete('/:reviewId/images/:imageIndex', [
  param('reviewId').notEmpty().withMessage('Valid review ID is required'),
  param('imageIndex').isInt({ min: 0 }).withMessage('Valid image index is required'),
], validate, reviewController.deleteReviewImage);

// Get user reviews
router.get('/user/reviews', reviewController.getUserReviews);

// Get all reviews (admin)
router.get('/admin/all', [
  query('productId').optional().notEmpty().withMessage('Valid product ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Valid status is required'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'helpful']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminAuth, reviewController.getAllReviews);

module.exports = router; 