const express = require('express');
const { body, param, query } = require('express-validator');
const giftCardController = require('../controlllers/giftCardController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// Create gift card
router.post('/', auth, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
  body('type').optional().isIn(['physical', 'digital']).withMessage('Type must be physical or digital'),
  body('issuedToEmail').optional().isEmail().withMessage('Valid email is required'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message must be less than 500 characters'),
  body('expiresAt').optional().isISO8601().withMessage('Valid date is required'),
], validate, giftCardController.createGiftCard);

// Get gift card by code
router.get('/code/:code', [
  param('code').notEmpty().withMessage('Gift card code is required'),
], validate, giftCardController.getGiftCardByCode);

// Use gift card
router.post('/use', auth, [
  body('code').notEmpty().withMessage('Gift card code is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
], validate, giftCardController.useGiftCard);

// Get user's gift cards
router.get('/user', auth, [
  query('status').optional().isIn(['active', 'used', 'expired', 'cancelled']).withMessage('Valid status is required'),
  query('type').optional().isIn(['physical', 'digital']).withMessage('Valid type is required'),
], validate, giftCardController.getUserGiftCards);

// Get gift card history
router.get('/:giftCardId/history', auth, [
  param('giftCardId').isMongoId().withMessage('Valid gift card ID is required'),
], validate, giftCardController.getGiftCardHistory);

// Cancel gift card
router.put('/:giftCardId/cancel', auth, [
  param('giftCardId').isMongoId().withMessage('Valid gift card ID is required'),
], validate, giftCardController.cancelGiftCard);

// Admin routes
// Get all gift cards
router.get('/admin/all', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'used', 'expired', 'cancelled']).withMessage('Valid status is required'),
  query('type').optional().isIn(['physical', 'digital']).withMessage('Valid type is required'),
  query('search').optional().trim(),
], validate, giftCardController.getAllGiftCards);

// Get gift card statistics
router.get('/admin/stats', auth, giftCardController.getGiftCardStats);

module.exports = router; 