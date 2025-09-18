const express = require('express');
const { body, param, query } = require('express-validator');
const orderController = require('../controlllers/orderController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// User routes - require authentication
// Get user orders
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required'),
], validate, orderController.getUserOrders);

// Get order by ID
router.get('/:id', [
  auth,
  param('id').notEmpty().withMessage('Order ID is required'),
], validate, orderController.getOrder);

// Create order (checkout)
router.post('/checkout', [
  auth,
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('paymentMethod').isIn(['stripe', 'paypal', 'cash_on_delivery', 'bank_transfer']).withMessage('Valid payment method is required'),
  body('notes').optional().trim(),
], validate, orderController.createOrder);

// Cancel order
router.post('/:id/cancel', [
  auth,
  param('id').notEmpty().withMessage('Order ID is required'),
  body('reason').optional().trim(),
], validate, orderController.cancelOrder);

// Get order statistics
router.get('/stats/overview', [
  auth,
], orderController.getOrderStats);

// Get recent orders
router.get('/recent/list', [
  auth,
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
], validate, orderController.getRecentOrders);

// Admin routes - require admin authentication
// Get all orders (admin)
router.get('/admin/all', [
  auth,
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'all']).withMessage('Valid status is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], validate, orderController.getAllOrders);

// Update order status (admin)
router.put('/admin/:id/status', [
  auth,
  param('id').notEmpty().withMessage('Order ID is required'),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required'),
  body('trackingNumber').optional().trim(),
  body('estimatedDelivery').optional().isISO8601().withMessage('Valid estimated delivery date is required'),
], validate, orderController.updateOrderStatus);

// Get order analytics (admin)
router.get('/admin/analytics', [
  auth,
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
], validate, orderController.getOrderAnalytics);

module.exports = router; 