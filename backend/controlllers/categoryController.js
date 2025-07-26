const Category = require('../models/Category');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Category.countDocuments(query);

    res.json({
      categories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const categoryData = {
      name,
      description,
    };

    // Handle image upload if provided
    if (req.file) {
      const imageResult = await uploadImage(req.file, 'categories');
      categoryData.image = {
        public_id: imageResult.public_id,
        url: imageResult.url,
      };
    }

    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle image upload if provided
    if (req.file) {
      // Delete old image if exists
      if (category.image && category.image.public_id) {
        await deleteImage(category.image.public_id);
      }

      const imageResult = await uploadImage(req.file, 'categories');
      updateData.image = {
        public_id: imageResult.public_id,
        url: imageResult.url,
      };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary if exists
    if (category.image && category.image.public_id) {
      await deleteImage(category.image.public_id);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling category status', error: error.message });
  }
};

// Upload category image
exports.uploadCategoryImage = [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const imageResult = await uploadImage(req.file, 'categories');
      res.json({
        public_id: imageResult.public_id,
        url: imageResult.url,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
  }
]; 