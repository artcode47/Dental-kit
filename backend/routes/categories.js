const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controlllers/categoryController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
// Category products by slug (public)
router.get('/:slug/products', categoryController.getProductsByCategorySlug);
router.get('/:id', [
  param('id').notEmpty().withMessage('Invalid category ID'),
], validate, categoryController.getCategory);

// Admin routes
router.use(auth, adminAuth);

router.post('/', [
  body('name').notEmpty().trim().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('parentId').optional().trim(),
  body('slug').optional().trim(),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
], validate, categoryController.createCategory);

router.put('/:id', [
  param('id').notEmpty().withMessage('Invalid category ID'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('parentId').optional().trim(),
  body('slug').optional().trim(),
  body('metaTitle').optional().trim(),
  body('metaDescription').optional().trim(),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
], validate, categoryController.updateCategory);

router.delete('/:id', [
  param('id').notEmpty().withMessage('Invalid category ID'),
], validate, categoryController.deleteCategory);

router.patch('/:id/toggle', [
  param('id').notEmpty().withMessage('Invalid category ID'),
], validate, categoryController.toggleCategoryStatus);

module.exports = router; 