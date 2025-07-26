const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controlllers/userController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(auth);

// Profile management
router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Valid gender is required'),
], validate, userController.updateProfile);

// Address management
router.get('/addresses', userController.getAddresses);
router.post('/addresses', [
  body('type').isIn(['shipping', 'billing', 'both']).withMessage('Valid address type is required'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('address1').notEmpty().trim().withMessage('Address is required'),
  body('city').notEmpty().trim().withMessage('City is required'),
  body('state').notEmpty().trim().withMessage('State is required'),
  body('country').notEmpty().trim().withMessage('Country is required'),
  body('zipCode').notEmpty().trim().withMessage('ZIP code is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address2').optional().trim(),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
], validate, userController.addAddress);

router.put('/addresses/:addressId', [
  param('addressId').notEmpty().withMessage('Address ID is required'),
  body('type').optional().isIn(['shipping', 'billing', 'both']).withMessage('Valid address type is required'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('address1').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address2').optional().trim(),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
], validate, userController.updateAddress);

router.delete('/addresses/:addressId', [
  param('addressId').notEmpty().withMessage('Address ID is required'),
], validate, userController.deleteAddress);

router.patch('/addresses/:addressId/default', [
  param('addressId').notEmpty().withMessage('Address ID is required'),
], validate, userController.setDefaultAddress);

// Preferences
router.get('/preferences', userController.getPreferences);
router.put('/preferences', [
  body('preferences.newsletter').optional().isBoolean().withMessage('Newsletter preference must be a boolean'),
  body('preferences.marketing').optional().isBoolean().withMessage('Marketing preference must be a boolean'),
  body('preferences.orderUpdates').optional().isBoolean().withMessage('Order updates preference must be a boolean'),
  body('preferences.productRecommendations').optional().isBoolean().withMessage('Product recommendations preference must be a boolean'),
  body('emailPreferences.marketing').optional().isBoolean().withMessage('Email marketing preference must be a boolean'),
  body('emailPreferences.security').optional().isBoolean().withMessage('Email security preference must be a boolean'),
  body('emailPreferences.updates').optional().isBoolean().withMessage('Email updates preference must be a boolean'),
], validate, userController.updatePreferences);

// Order history
router.get('/orders', userController.getOrderHistory);
router.get('/orders/:orderId', [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
], validate, userController.getOrder);
router.post('/orders/:orderId/cancel', [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('reason').optional().trim(),
], validate, userController.cancelOrder);

// User statistics
router.get('/stats', userController.getUserStats);

module.exports = router; 