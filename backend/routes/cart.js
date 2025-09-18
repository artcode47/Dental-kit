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
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], validate, cartController.addToCart);

// Update cart item quantity
router.put('/items/:productId', [
  param('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be at least 0'),
], validate, cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:productId', [
  param('productId').notEmpty().withMessage('Product ID is required'),
], validate, cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

// Apply coupon
router.post('/apply-coupon', [
  body('couponCode').notEmpty().withMessage('Coupon code is required'),
], validate, cartController.applyCoupon);

// Remove coupon
router.delete('/remove-coupon', cartController.removeCoupon);

// Get cart item count
router.get('/count', cartController.getCartItemCount);

// Merge guest cart
router.post('/merge-guest', [
  body('guestCartItems').isArray().withMessage('Guest cart items must be an array'),
], validate, cartController.mergeGuestCart);

module.exports = router; 