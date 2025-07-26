const express = require('express');
const { body, param, query } = require('express-validator');
const couponController = require('../controlllers/couponController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// Validate coupon (authenticated)
router.post('/validate', [
  auth,
  body('code').notEmpty().trim().withMessage('Coupon code is required'),
  body('orderAmount').isFloat({ min: 0 }).withMessage('Order amount must be a positive number'),
], validate, couponController.validateCoupon);

// Apply coupon to order (authenticated)
router.post('/apply', [
  auth,
  body('code').notEmpty().trim().withMessage('Coupon code is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
], validate, couponController.applyCoupon);

// Admin routes
// Get all coupons
router.get('/admin/all', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
], validate, couponController.getAllCoupons);

// Get single coupon
router.get('/admin/:id', [
  param('id').isMongoId().withMessage('Valid coupon ID is required'),
], validate, couponController.getCoupon);

// Create coupon
router.post('/admin/create', [
  body('code').notEmpty().trim().withMessage('Coupon code is required'),
  body('name').notEmpty().trim().withMessage('Coupon name is required'),
  body('description').optional().trim(),
  body('discountType').isIn(['percentage', 'fixed', 'free_shipping']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer'),
  body('maxUsesPerUser').optional().isInt({ min: 1 }).withMessage('Max uses per user must be a positive integer'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
  body('minimumOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maximumDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Maximum discount amount must be positive'),
  body('applicableProducts').optional().isArray().withMessage('Applicable products must be an array'),
  body('applicableProducts.*').optional().isMongoId().withMessage('Invalid product ID'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicableCategories.*').optional().isMongoId().withMessage('Invalid category ID'),
  body('excludedProducts').optional().isArray().withMessage('Excluded products must be an array'),
  body('excludedProducts.*').optional().isMongoId().withMessage('Invalid product ID'),
  body('excludedCategories').optional().isArray().withMessage('Excluded categories must be an array'),
  body('excludedCategories.*').optional().isMongoId().withMessage('Invalid category ID'),
  body('applicableUsers').optional().isArray().withMessage('Applicable users must be an array'),
  body('applicableUsers.*').optional().isMongoId().withMessage('Invalid user ID'),
  body('userGroups').optional().isArray().withMessage('User groups must be an array'),
  body('userGroups.*').optional().isIn(['new_users', 'returning_customers', 'vip_customers', 'all']).withMessage('Invalid user group'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
], validate, couponController.createCoupon);

// Update coupon
router.put('/admin/:id', [
  param('id').isMongoId().withMessage('Valid coupon ID is required'),
  body('code').optional().trim(),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('discountType').optional().isIn(['percentage', 'fixed', 'free_shipping']).withMessage('Invalid discount type'),
  body('discountValue').optional().isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer'),
  body('maxUsesPerUser').optional().isInt({ min: 1 }).withMessage('Max uses per user must be a positive integer'),
  body('validFrom').optional().isISO8601().withMessage('Valid from date is required'),
  body('validUntil').optional().isISO8601().withMessage('Valid until date is required'),
  body('minimumOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maximumDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Maximum discount amount must be positive'),
  body('applicableProducts').optional().isArray().withMessage('Applicable products must be an array'),
  body('applicableProducts.*').optional().isMongoId().withMessage('Invalid product ID'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicableCategories.*').optional().isMongoId().withMessage('Invalid category ID'),
  body('excludedProducts').optional().isArray().withMessage('Excluded products must be an array'),
  body('excludedProducts.*').optional().isMongoId().withMessage('Invalid product ID'),
  body('excludedCategories').optional().isArray().withMessage('Excluded categories must be an array'),
  body('excludedCategories.*').optional().isMongoId().withMessage('Invalid category ID'),
  body('applicableUsers').optional().isArray().withMessage('Applicable users must be an array'),
  body('applicableUsers.*').optional().isMongoId().withMessage('Invalid user ID'),
  body('userGroups').optional().isArray().withMessage('User groups must be an array'),
  body('userGroups.*').optional().isIn(['new_users', 'returning_customers', 'vip_customers', 'all']).withMessage('Invalid user group'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
], validate, couponController.updateCoupon);

// Delete coupon
router.delete('/admin/:id', [
  param('id').isMongoId().withMessage('Valid coupon ID is required'),
], validate, couponController.deleteCoupon);

// Toggle coupon status
router.patch('/admin/:id/toggle', [
  param('id').isMongoId().withMessage('Valid coupon ID is required'),
], validate, couponController.toggleCouponStatus);

// Get coupon statistics
router.get('/admin/stats', [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
], validate, couponController.getCouponStats);

// Generate coupon code
router.post('/admin/generate-code', [
  body('prefix').optional().trim().isLength({ max: 10 }).withMessage('Prefix must be less than 10 characters'),
  body('length').optional().isInt({ min: 4, max: 12 }).withMessage('Length must be between 4 and 12'),
], validate, couponController.generateCouponCode);

module.exports = router; 