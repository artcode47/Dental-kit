const express = require('express');
const { query } = require('express-validator');
const adminController = require('../controlllers/adminController');
const validate = require('../middleware/validate');
const settingsController = require('../controlllers/settingsController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth, adminAuth);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Analytics
router.get('/analytics', [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Valid period is required'),
], validate, adminController.getAnalytics);

// Users management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['user', 'admin', 'vendor']).withMessage('Valid role is required'),
  query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Valid status is required'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'lastLogin', 'name', 'email']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllUsers);

// Users bulk operations
router.post('/users/bulk', adminController.bulkUserOperations);

// Create user (admin)
router.post('/users', adminController.createUser);

// Update user (admin)
router.put('/users/:userId', adminController.updateUser);

// Delete user (admin)
router.delete('/users/:userId', adminController.deleteUser);

// Orders management
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Valid status is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'total', 'status']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllOrders);

// Orders bulk operations
router.post('/orders/bulk', adminController.bulkOrderOperations);

// Update order status
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Products management
router.get('/products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().notEmpty().withMessage('Valid category ID is required'),
  query('vendor').optional().notEmpty().withMessage('Valid vendor ID is required'),
  query('status').optional().isIn(['active', 'inactive', 'out_of_stock']).withMessage('Valid status is required'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'price', 'stock', 'sales']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllProducts);

// Categories management
router.get('/categories', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('parentId').optional().trim(),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'name', 'productCount']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllCategories);

// Vendors management
router.get('/vendors', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'name', 'productCount']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllVendors);

// Reviews management
router.get('/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Valid status is required'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'helpful']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, adminController.getAllReviews);

// System health check
router.get('/health', adminController.getSystemHealth);

// Settings
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router; 