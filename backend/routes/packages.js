const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const packageController = require('../controlllers/packageController');

const router = express.Router();

// Public: list packages
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'discountPercentage', 'packagePrice']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], validate, packageController.getPackages);

// Public: get one package
router.get('/:id', [
  param('id').notEmpty().withMessage('Package ID is required')
], validate, packageController.getPackageById);

// Admin: create package
router.post('/', auth, adminAuth, [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('packagePrice').isFloat({ min: 0 }).withMessage('Valid package price is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], validate, packageController.createPackage);

// Admin: update package
router.put('/:id', auth, adminAuth, [
  param('id').notEmpty().withMessage('Package ID is required')
], validate, packageController.updatePackage);

// Admin: delete package
router.delete('/:id', auth, adminAuth, [
  param('id').notEmpty().withMessage('Package ID is required')
], validate, packageController.deletePackage);

// Public: combined endpoint packages + discounted products
router.get('/combined/list', [
  query('limitPackages').optional().isInt({ min: 1, max: 100 }),
  query('limitProducts').optional().isInt({ min: 1, max: 100 })
], validate, packageController.getPackagesAndDiscounts);

module.exports = router;




