const CategoryService = require('../services/categoryService');
const ProductService = require('../services/productService');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

const categoryService = new CategoryService();
const productService = new ProductService();

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      sortBy,
      sortOrder,
      includeProductCount: true
    };

    const result = await categoryService.getCategories(options);

    res.json({
      categories: result.categories,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
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
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Get products for a category by slug (public)
exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 12 } = req.query;
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const productsResult = await productService.getProducts({ category: category.id, limit: parseInt(limit) });
    res.json(productsResult.products || productsResult || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category products', error: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, nameAr, description } = req.body;

    // Check if category already exists
    const existingCategory = await categoryService.findOneBy('name', name);
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const categoryData = {
      name,
      nameAr,
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

    const category = await categoryService.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, nameAr, description, isActive } = req.body;
    const category = await categoryService.getById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await categoryService.findOneBy('name', name);
      if (existingCategory && existingCategory.id !== req.params.id) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (nameAr !== undefined) updateData.nameAr = nameAr;
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

    const updatedCategory = await categoryService.update(req.params.id, updateData);

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary if exists
    if (category.image && category.image.public_id) {
      await deleteImage(category.image.public_id);
    }

    await categoryService.delete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await categoryService.update(req.params.id, {
      isActive: !category.isActive
    });

    res.json(updatedCategory);
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