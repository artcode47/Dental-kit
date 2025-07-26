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

// Add product to wishlist
router.post('/add', [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
], validate, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
], validate, wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', wishlistController.clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
], validate, wishlistController.checkWishlistStatus);

// Move wishlist item to cart
router.post('/move-to-cart/:productId', [
  param('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], validate, wishlistController.moveToCart);

// Get wishlist count
router.get('/count', wishlistController.getWishlistCount);

module.exports = router; 