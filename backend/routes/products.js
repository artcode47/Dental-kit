const express = require('express');
const { body, param, query } = require('express-validator');
const productController = require('../controlllers/productController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');

const router = express.Router();

// Get all products
router.get('/', productController.getProducts);

// Search products
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
], validate, productController.searchProducts);

// Get related products
router.get('/:id/related', [
  param('id').notEmpty().withMessage('Product ID is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
], validate, productController.getRelatedProducts);

// Get products by category
router.get('/category/:categoryId', [
  param('categoryId').notEmpty().withMessage('Category ID is required'),
], validate, productController.getProductsByCategory);

// Get products by vendor
router.get('/vendor/:vendorId', [
  param('vendorId').notEmpty().withMessage('Vendor ID is required'),
], validate, productController.getProductsByVendor);

// Get brands (must be before /:id)
router.get('/brands', productController.getBrands);

// Get categories (must be before /:id)
router.get('/categories', productController.getCategories);

// Get category by ID (must be before /:id)
router.get('/categories/:id', [
  param('id').notEmpty().withMessage('Category ID is required'),
], validate, productController.getCategory);

// Upload multiple product images (admin only)
router.post('/upload-images', auth, uploadMultiple, handleUploadError, cleanupUploads, productController.uploadProductImages);

// Get single product
router.get('/:id', [
  param('id').notEmpty().withMessage('Product ID is required'),
], validate, productController.getProduct);

// Create product (admin only)
router.post('/', [
  auth,
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('description').notEmpty().trim().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('brand').optional().trim(),
  body('images').optional().isArray().withMessage('Images must be an array'),
], validate, productController.createProduct);

// Update product (admin only)
router.put('/:id', [
  auth,
  param('id').notEmpty().withMessage('Product ID is required'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('categoryId').optional().notEmpty().withMessage('Category ID is required'),
  body('vendorId').optional().notEmpty().withMessage('Vendor ID is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('brand').optional().trim(),
  body('images').optional().isArray().withMessage('Images must be an array'),
], validate, productController.updateProduct);

// Delete product (admin only)
router.delete('/:id', [
  auth,
  param('id').notEmpty().withMessage('Product ID is required'),
], validate, productController.deleteProduct);

// Update product stock (admin only)
router.patch('/:id/stock', [
  auth,
  param('id').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
  body('operation').optional().isIn(['increase', 'decrease', 'set']).withMessage('Operation must be increase, decrease, or set'),
], validate, productController.updateProductStock);

module.exports = router; 