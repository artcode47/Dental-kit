const express = require('express');
const { body, param } = require('express-validator');
const vendorController = require('../controlllers/vendorController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.get('/', vendorController.getAllVendors);
router.get('/:id', [
  param('id').notEmpty().withMessage('Invalid vendor ID'),
], validate, vendorController.getVendor);

router.get('/slug/:slug', [
  param('slug').notEmpty().withMessage('Slug is required'),
], validate, vendorController.getVendorBySlug);

// Admin routes
router.use(auth, adminAuth);

router.post('/', [
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