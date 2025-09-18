const express = require('express');
const { body, param } = require('express-validator');
const productComparisonController = require('../controlllers/productComparisonController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// All comparison routes require authentication
router.use(auth);

// Get user's comparison list
router.get('/', productComparisonController.getUserComparison);

// Add product to comparison
router.post('/add', [
  body('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, productComparisonController.addToComparison);

// Remove product from comparison
router.delete('/remove/:productId', [
  param('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, productComparisonController.removeFromComparison);

// Clear comparison
router.delete('/clear', productComparisonController.clearComparison);

// Get comparison with product details
router.get('/with-products', productComparisonController.getComparisonWithProducts);

// Check if product is in comparison
router.get('/check/:productId', [
  param('productId').notEmpty().withMessage('Valid product ID is required'),
], validate, productComparisonController.checkProductInComparison);

// Get comparison count
router.get('/count', productComparisonController.getComparisonCount);

module.exports = router; 