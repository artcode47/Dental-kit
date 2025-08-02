const express = require('express');
const { body, query } = require('express-validator');
const adminController = require('../controlllers/adminController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(auth);

// Dashboard overview
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['verified', 'unverified']).withMessage('Valid status is required'),
  query('sortBy').optional().isIn(['createdAt', 'firstName', 'lastName', 'email']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllUsers);

// Bulk user operations
router.post('/users/bulk', [
  body('operation').isIn(['verify', 'unverify', 'delete']).withMessage('Valid operation is required'),
  body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
], validate, adminController.bulkUserOperations);

// Product management
router.get('/products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('category').optional().isMongoId().withMessage('Valid category ID is required'),
  query('vendor').optional().isMongoId().withMessage('Valid vendor ID is required'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Valid status is required'),
  query('sortBy').optional().isIn(['createdAt', 'name', 'price', 'stock']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllProducts);

// Bulk product operations
router.post('/products/bulk', [
  body('operation').isIn(['activate', 'deactivate', 'update', 'delete']).withMessage('Valid operation is required'),
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('data').optional().isObject().withMessage('Data must be an object'),
], validate, adminController.bulkProductOperations);

// Order management
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Valid status is required'),
  query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).withMessage('Valid payment status is required'),
  query('dateFrom').optional().isISO8601().withMessage('Valid date is required'),
  query('dateTo').optional().isISO8601().withMessage('Valid date is required'),
  query('sortBy').optional().isIn(['createdAt', 'total', 'status']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllOrders);

// Bulk order operations
router.post('/orders/bulk', [
  body('operation').isIn(['updateStatus', 'updatePaymentStatus', 'delete']).withMessage('Valid operation is required'),
  body('orderIds').isArray({ min: 1 }).withMessage('Order IDs array is required'),
  body('data').optional().isObject().withMessage('Data must be an object'),
], validate, adminController.bulkOrderOperations);

// Analytics and reports
router.get('/analytics', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Valid period is required'),
], validate, adminController.getAnalytics);

// System health check
router.get('/health', adminController.getSystemHealth);

module.exports = router; 