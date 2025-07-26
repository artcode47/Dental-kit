const express = require('express');
const { body, param, query } = require('express-validator');
const reviewController = require('../controlllers/reviewController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');

const router = express.Router();

// Get reviews for a product (public)
router.get('/product/:productId', [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'helpfulVotes']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, reviewController.getProductReviews);

// Create review (authenticated)
router.post('/', [
  auth,
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').notEmpty().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('comment').notEmpty().trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
], validate, reviewController.createReview);

// Update review (authenticated)
router.put('/:reviewId', [
  auth,
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('comment').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
], validate, reviewController.updateReview);

// Delete review (authenticated)
router.delete('/:reviewId', [
  auth,
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
], validate, reviewController.deleteReview);

// Vote review as helpful (authenticated)
router.post('/:reviewId/vote', [
  auth,
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('isHelpful').isBoolean().withMessage('isHelpful must be a boolean'),
], validate, reviewController.voteReview);

// Flag review (authenticated)
router.post('/:reviewId/flag', [
  auth,
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('reason').notEmpty().trim().isLength({ min: 5, max: 200 }).withMessage('Reason must be between 5 and 200 characters'),
], validate, reviewController.flagReview);

// Vendor response to review (authenticated - vendor only)
router.post('/:reviewId/response', [
  auth,
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('comment').notEmpty().trim().isLength({ min: 10, max: 500 }).withMessage('Response must be between 10 and 500 characters'),
], validate, reviewController.addVendorResponse);

// Admin routes
// Get all reviews for moderation
router.get('/admin/all', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'flagged']).withMessage('Invalid status'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('productId').optional().isMongoId().withMessage('Valid product ID is required'),
], validate, reviewController.getAllReviews);

// Moderate review
router.put('/admin/:reviewId/moderate', [
  param('reviewId').isMongoId().withMessage('Valid review ID is required'),
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean'),
  body('moderationNotes').optional().trim().isLength({ max: 500 }).withMessage('Moderation notes must be less than 500 characters'),
], validate, reviewController.moderateReview);

// Upload review images
router.post('/upload-images', [
  auth,
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
], reviewController.uploadReviewImages);

module.exports = router; 