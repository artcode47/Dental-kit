const express = require('express');
const { body, param } = require('express-validator');
const vendorController = require('../controlllers/vendorController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { uploadSingle, uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');

const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');

// Public routes
router.get('/', vendorController.getAllVendors);
router.get('/:id', [
  param('id').notEmpty().withMessage('Invalid vendor ID'),
], validate, vendorController.getVendor);

router.get('/slug/:slug', [
  param('slug').notEmpty().withMessage('Slug is required'),
], validate, vendorController.getVendorBySlug);

// Vendor self-service routes
router.use('/me', auth, vendorAuth);
router.get('/me/profile', vendorController.getMyProfile);
router.put('/me/profile', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
], vendorController.updateMyProfile);
router.get('/me/products', vendorController.getMyProducts);
router.post('/me/products', [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('categoryId').notEmpty(),
  body('stock').isInt({ min: 0 }),
], validate, vendorController.createMyProduct);
router.put('/me/products/:id', [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  param('id').notEmpty(),
], validate, vendorController.updateMyProduct);
router.patch('/me/products/:id/stock', [
  param('id').notEmpty(),
  body('quantity').isInt({ min: 0 }),
  body('operation').optional().isIn(['increase', 'decrease', 'set'])
], validate, vendorController.updateMyProductStock);
router.delete('/me/products/:id', [
  param('id').notEmpty(),
], validate, vendorController.deleteMyProduct);
router.get('/me/stats', vendorController.getMyStats);
router.get('/me/orders', vendorController.getMyOrders);

// Admin routes
router.use(auth, adminAuth);

router.post('/', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  body('name').notEmpty().trim().withMessage('Vendor name is required'),
  body('description').optional().trim(),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('logo').optional().trim(),
  body('banner').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
  body('slug').optional().trim(),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
], validate, vendorController.createVendor);

router.put('/:id', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  param('id').notEmpty().withMessage('Invalid vendor ID'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('logo').optional().trim(),
  body('banner').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
  body('slug').optional().trim(),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
], validate, vendorController.updateVendor);

router.delete('/:id', [
  param('id').notEmpty().withMessage('Invalid vendor ID'),
], validate, vendorController.deleteVendor);

router.patch('/:id/toggle', [
  param('id').notEmpty().withMessage('Invalid vendor ID'),
], validate, vendorController.toggleVendorStatus);

router.patch('/:id/verify', [
  param('id').notEmpty().withMessage('Invalid vendor ID'),
], validate, vendorController.verifyVendor);

module.exports = router; 