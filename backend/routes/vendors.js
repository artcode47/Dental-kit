const express = require('express');
const { body, param } = require('express-validator');
const vendorController = require('../controlllers/vendorController');
const validate = require('../middleware/validate');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

const router = express.Router();

// Get all vendors
router.get('/', vendorController.getAllVendors);

// Get single vendor
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
], validate, vendorController.getVendor);

// Get vendor by slug
router.get('/slug/:slug', [
  param('slug').notEmpty().withMessage('Slug is required'),
], validate, vendorController.getVendorBySlug);

// Get vendor products
router.get('/:id/products', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
], validate, vendorController.getVendorProducts);

// Create vendor
router.post('/', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  body('name').notEmpty().trim().withMessage('Vendor name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('description').optional().trim(),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('taxId').optional().trim(),
], validate, vendorController.createVendor);

// Update vendor
router.put('/:id', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('description').optional().trim(),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('taxId').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
], validate, vendorController.updateVendor);

// Delete vendor
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
], validate, vendorController.deleteVendor);

// Toggle vendor status
router.patch('/:id/toggle', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
], validate, vendorController.toggleVendorStatus);

// Verify vendor
router.patch('/:id/verify', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
], validate, vendorController.verifyVendor);

// Upload vendor logo
router.post('/upload-logo', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
], vendorController.uploadVendorLogo);

module.exports = router; 