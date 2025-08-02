const express = require('express');
const { body, param, query } = require('express-validator');
const productController = require('../controlllers/productController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');

const router = express.Router();

// Get all products
router.get('/', productController.getAllProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

// Get products on sale
router.get('/on-sale', productController.getProductsOnSale);

// Get all brands
router.get('/brands', productController.getBrands);

// Advanced search products
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
], validate, productController.searchProducts);

// Get search suggestions
router.get('/search/suggestions', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
], validate, productController.getSearchSuggestions);

// Get popular searches
router.get('/search/popular', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
], validate, productController.getPopularSearches);

// Get product recommendations
router.get('/recommendations', auth, [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
], validate, productController.getProductRecommendations);

// Get single product
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid product ID'),
], validate, productController.getProduct);

// Get product by slug
router.get('/slug/:slug', [
  param('slug').notEmpty().withMessage('Slug is required'),
], validate, productController.getProductBySlug);

// Create product
router.post('/', [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('description').notEmpty().trim().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('vendor').isMongoId().withMessage('Valid vendor ID is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be positive'),
  body('brand').optional().trim(),
  body('shortDescription').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('salePercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Sale percentage must be between 0 and 100'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isOnSale').optional().isBoolean().withMessage('isOnSale must be a boolean'),
  body('tags').optional().isString().withMessage('Tags must be a comma-separated string'),
  body('features').optional().isString().withMessage('Features must be a comma-separated string'),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
], validate, productController.createProduct);

// Update product
router.put('/:id', [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('vendor').optional().isMongoId().withMessage('Valid vendor ID is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be positive'),
  body('brand').optional().trim(),
  body('shortDescription').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('salePercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Sale percentage must be between 0 and 100'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  body('isOnSale').optional().isBoolean().withMessage('isOnSale must be a boolean'),
  body('tags').optional().isString().withMessage('Tags must be a comma-separated string'),
  body('features').optional().isString().withMessage('Features must be a comma-separated string'),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
], validate, productController.updateProduct);

// Delete product
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid product ID'),
], validate, productController.deleteProduct);

// Delete product image
router.delete('/:productId/images/:imageId', [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  param('imageId').notEmpty().withMessage('Image ID is required'),
], validate, productController.deleteProductImage);

// Upload product images
router.post('/upload-images', [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
], productController.uploadProductImages);

module.exports = router; 