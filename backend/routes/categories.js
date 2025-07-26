const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controlllers/categoryController');
const validate = require('../middleware/validate');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

const router = express.Router();

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get single category
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid category ID'),
], validate, categoryController.getCategory);

// Get category by slug
router.get('/slug/:slug', [
  param('slug').notEmpty().withMessage('Slug is required'),
], validate, categoryController.getCategoryBySlug);

// Create category
router.post('/', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  body('name').notEmpty().trim().withMessage('Category name is required'),
  body('description').optional().trim(),
], validate, categoryController.createCategory);

// Update category
router.put('/:id', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
], validate, categoryController.updateCategory);

// Delete category
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid category ID'),
], validate, categoryController.deleteCategory);

// Toggle category status
router.patch('/:id/toggle', [
  param('id').isMongoId().withMessage('Invalid category ID'),
], validate, categoryController.toggleCategoryStatus);

// Upload category image
router.post('/upload-image', [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
], categoryController.uploadCategoryImage);

module.exports = router; 