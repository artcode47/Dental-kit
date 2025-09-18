const express = require('express');
const { body, param, query } = require('express-validator');
const giftCardController = require('../controlllers/giftCardController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.get('/validate/:code', giftCardController.getGiftCardByCode);

// Authenticated routes
router.use(auth);

// Apply gift card to order
router.post('/apply', [
  body('code').notEmpty().trim().withMessage('Gift card code is required'),
  body('orderId').notEmpty().withMessage('Valid order ID is required'),
], validate, giftCardController.applyGiftCard);

// Admin routes
router.use(adminAuth);

// Get all gift cards
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'used', 'expired', 'cancelled']).withMessage('Valid status is required'),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'expiresAt', 'amount', 'balance']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], validate, giftCardController.getAllGiftCards);

// Get gift card by ID
router.get('/:giftCardId', [
  param('giftCardId').notEmpty().withMessage('Valid gift card ID is required'),
], validate, giftCardController.getGiftCard);

// Update gift card
router.put('/:giftCardId', [
  param('giftCardId').notEmpty().withMessage('Valid gift card ID is required'),
], validate, giftCardController.updateGiftCard);

// Delete gift card
router.delete('/:giftCardId', [
  param('giftCardId').notEmpty().withMessage('Valid gift card ID is required'),
], validate, giftCardController.deleteGiftCard);

// Get gift card statistics
router.get('/stats/overview', giftCardController.getGiftCardStats);

// Generate unique gift card code
router.post('/generate-code', giftCardController.generateGiftCardCode);

module.exports = router; 