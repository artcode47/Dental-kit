const express = require('express');
const { body, param, query } = require('express-validator');
const couponController = require('../controlllers/couponController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.get('/validate/:code', couponController.validateCoupon);

// Authenticated routes
router.use(auth);

// Apply coupon to order
router.post('/apply', [
  body('code').notEmpty().trim().withMessage('Coupon code is required'),
  body('orderId').notEmpty().withMessage('Valid order ID is required'),
], validate, couponController.applyCoupon);

// Admin routes
router.use(adminAuth);

// Get all coupons
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('discountType').optional().isIn(['percentage', 'fixed']).withMessage('Valid discount type is required'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'expiresAt', 'usageCount', 'discountAmount']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, couponController.getAllCoupons);

// Get coupon by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Valid coupon ID is required'),
], validate, couponController.getCoupon);

// Create coupon
router.post('/', [
  body('code').notEmpty().trim().withMessage('Coupon code is required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Valid discount type is required'),
  body('discountAmount').isFloat({ min: 0 }).withMessage('Discount amount must be positive'),
  body('minimumOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maximumDiscount').optional().isFloat({ min: 0 }).withMessage('Maximum discount must be positive'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be positive'),
  body('userUsageLimit').optional().isInt({ min: 1 }).withMessage('User usage limit must be positive'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('startsAt').optional().isISO8601().withMessage('Valid start date is required'),
  body('expiresAt').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('description').optional().trim(),
  body('applicableProducts').optional().isArray().withMessage('Applicable products must be an array'),
  body('applicableProducts.*').optional().notEmpty().withMessage('Invalid product ID'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicableCategories.*').optional().notEmpty().withMessage('Invalid category ID'),
  body('excludedProducts').optional().isArray().withMessage('Excluded products must be an array'),
  body('excludedProducts.*').optional().notEmpty().withMessage('Invalid product ID'),
  body('excludedCategories').optional().isArray().withMessage('Excluded categories must be an array'),
  body('excludedCategories.*').optional().notEmpty().withMessage('Invalid category ID'),
  body('applicableUsers').optional().isArray().withMessage('Applicable users must be an array'),
  body('applicableUsers.*').optional().notEmpty().withMessage('Invalid user ID'),
], validate, couponController.createCoupon);

// Update coupon
router.put('/:id', [
  param('id').notEmpty().withMessage('Valid coupon ID is required'),
  body('code').optional().trim(),
  body('discountType').optional().isIn(['percentage', 'fixed']).withMessage('Valid discount type is required'),
  body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be positive'),
  body('minimumOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maximumDiscount').optional().isFloat({ min: 0 }).withMessage('Maximum discount must be positive'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be positive'),
  body('userUsageLimit').optional().isInt({ min: 1 }).withMessage('User usage limit must be positive'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('startsAt').optional().isISO8601().withMessage('Valid start date is required'),
  body('expiresAt').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('description').optional().trim(),
  body('applicableProducts').optional().isArray().withMessage('Applicable products must be an array'),
  body('applicableProducts.*').optional().notEmpty().withMessage('Invalid product ID'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicableCategories.*').optional().notEmpty().withMessage('Invalid category ID'),
  body('excludedProducts').optional().isArray().withMessage('Excluded products must be an array'),
  body('excludedProducts.*').optional().notEmpty().withMessage('Invalid product ID'),
  body('excludedCategories').optional().isArray().withMessage('Excluded categories must be an array'),
  body('excludedCategories.*').optional().notEmpty().withMessage('Invalid category ID'),
  body('applicableUsers').optional().isArray().withMessage('Applicable users must be an array'),
  body('applicableUsers.*').optional().notEmpty().withMessage('Invalid user ID'),
], validate, couponController.updateCoupon);

// Delete coupon
router.delete('/:id', [
  param('id').notEmpty().withMessage('Valid coupon ID is required'),
], validate, couponController.deleteCoupon);

// Toggle coupon status
router.patch('/:id/toggle', [
  param('id').notEmpty().withMessage('Valid coupon ID is required'),
], validate, couponController.toggleCouponStatus);

// Get coupon statistics
router.get('/:id/stats', [
  param('id').notEmpty().withMessage('Valid coupon ID is required'),
], validate, couponController.getCouponStats);

// Generate unique coupon code
router.post('/generate-code', couponController.generateCouponCode);

module.exports = router; 