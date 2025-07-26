const express = require('express');
const { body, param, query } = require('express-validator');
const productComparisonController = require('../controlllers/productComparisonController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's comparison
router.get('/', auth, productComparisonController.getUserComparison);

// Add product to comparison
router.post('/add', auth, [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
], validate, productComparisonController.addToComparison);

// Remove product from comparison
router.delete('/remove/:productId', auth, [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
], validate, productComparisonController.removeFromComparison);

// Clear comparison
router.delete('/clear', auth, productComparisonController.clearComparison);

// Get public comparison by share token
router.get('/public/:shareToken', [
  param('shareToken').notEmpty().withMessage('Share token is required'),
], validate, productComparisonController.getPublicComparison);

// Toggle comparison public/private
router.put('/visibility', auth, [
  body('isPublic').isBoolean().withMessage('isPublic must be a boolean'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
], validate, productComparisonController.togglePublic);

// Get comparison analytics for user
router.get('/analytics', auth, productComparisonController.getUserComparisonAnalytics);

// Admin routes
// Get comparison statistics
router.get('/admin/stats', auth, productComparisonController.getComparisonStats);

// Get all comparisons
router.get('/admin/all', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  query('search').optional().trim(),
], validate, productComparisonController.getAllComparisons);

module.exports = router; 