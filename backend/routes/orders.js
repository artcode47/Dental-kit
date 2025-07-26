const express = require('express');
const { body, param, query } = require('express-validator');
const orderController = require('../controlllers/orderController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// Create order (checkout) - requires authentication
router.post('/checkout', [
  auth,
  body('paymentMethod').isIn(['stripe', 'paypal', 'cash_on_delivery', 'bank_transfer']).withMessage('Valid payment method is required'),
  body('shippingMethod').isIn(['standard', 'express', 'overnight', 'pickup']).withMessage('Valid shipping method is required'),
  body('useDefaultAddresses').optional().isBoolean().withMessage('useDefaultAddresses must be a boolean'),
  body('customerNotes').optional().trim(),
  body('shippingAddress').optional().isObject().withMessage('Shipping address must be an object'),
  body('billingAddress').optional().isObject().withMessage('Billing address must be an object'),
], validate, orderController.createOrder);

// Admin routes (you can add admin middleware here later)
// Get all orders
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Valid status is required'),
  query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).withMessage('Valid payment status is required'),
  query('shippingStatus').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).withMessage('Valid shipping status is required'),
  query('search').optional().trim(),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
], validate, orderController.getAllOrders);

// Get single order
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid order ID is required'),
], validate, orderController.getOrder);

// Update order status
router.put('/:id/status', [
  param('id').isMongoId().withMessage('Valid order ID is required'),
  body('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Valid status is required'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).withMessage('Valid payment status is required'),
  body('shippingStatus').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).withMessage('Valid shipping status is required'),
  body('adminNotes').optional().trim(),
], validate, orderController.updateOrderStatus);

// Add tracking information
router.post('/:id/tracking', [
  param('id').isMongoId().withMessage('Valid order ID is required'),
  body('trackingNumber').notEmpty().trim().withMessage('Tracking number is required'),
  body('trackingUrl').optional().isURL().withMessage('Valid tracking URL is required'),
  body('estimatedDelivery').optional().isISO8601().withMessage('Valid estimated delivery date is required'),
], validate, orderController.addTrackingInfo);

// Get order statistics
router.get('/stats/overview', [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
], validate, orderController.getOrderStats);

module.exports = router; 