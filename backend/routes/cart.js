const express = require('express');
const { body, param } = require('express-validator');
const cartController = require('../controlllers/cartController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(auth);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], validate, cartController.addToCart);

// Update cart item quantity
router.put('/items/:productId', [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], validate, cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:productId', [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
], validate, cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

// Get cart summary (for checkout)
router.get('/summary', cartController.getCartSummary);

module.exports = router; 