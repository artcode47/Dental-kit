const express = require('express');
const { body, param } = require('express-validator');
const wishlistController = require('../controlllers/wishlistController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(auth);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/add', [
  body('productId').notEmpty().withMessage('Valid product ID is required'),
  body('notes').optional().trim(),
], validate, wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/remove/:productId', [
  param('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', wishlistController.clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', [
  param('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, wishlistController.checkWishlistStatus);

// Get wishlist count
router.get('/count', wishlistController.getWishlistCount);

// Move item to cart
router.post('/move-to-cart', [
  body('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, wishlistController.moveToCart);

// Toggle endpoint for frontend convenience
router.post('/toggle', [
  body('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, wishlistController.toggleWishlist);

module.exports = router; 