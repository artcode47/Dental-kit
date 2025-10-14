const FirebaseService = require('./firebaseService');

class CategoryService extends FirebaseService {
  constructor() {
    super('categories');
  }

  // Create a new category
  async createCategory(categoryData) {
    try {
      const category = {
        ...categoryData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(category);
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  // Get all categories with optional filtering and product count
  async getCategories(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        parentId,
        isActive,
        search,
        sortBy = 'name',
        sortOrder = 'asc',
        includeProductCount = true
      } = options;

      let filters = [];

      if (parentId !== undefined) {
        filters.push({ field: 'parentId', operator: '==', value: parentId });
      }
      if (isActive !== undefined) {
        filters.push({ field: 'isActive', operator: '==', value: isActive });
      }

      const categories = await this.getAll({
        filters,
        sortBy,
        sortOrder,
        limitCount: limit
      });

      // Apply search filter if provided
      let filteredCategories = categories;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCategories = categories.filter(category => 
          category.name.toLowerCase().includes(searchLower) ||
          category.description?.toLowerCase().includes(searchLower)
        );
      }

      // Add product count to each category if requested
      if (includeProductCount) {
        const ProductService = require('./productService');
        const productService = new ProductService();
        
        for (let category of filteredCategories) {
          try {
            const productsResult = await productService.getProducts({ 
              category: category.id, 
              limit: 1000 
            });
            category.productCount = productsResult.products ? productsResult.products.length : 0;
          } catch (error) {
            console.warn(`Failed to get product count for category ${category.id}:`, error.message);
            category.productCount = 0;
          }
        }
      }

      // Calculate pagination
      const total = filteredCategories.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

      return {
        categories: paginatedCategories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error getting categories: ${error.message}`);
    }
  }

  // Get category by ID
  async getCategoryById(id) {
    try {
      const category = await this.getById(id);
      if (!category || !category.isActive) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error(`Error getting category: ${error.message}`);
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug) {
    try {
      const categories = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }]
      });
      
      const category = categories.find(cat => cat.id === slug || cat.slug === slug);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error(`Error getting category by slug: ${error.message}`);
    }
  }

  // Update category
  async updateCategory(id, updateData) {
    try {
      const category = await this.getById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      const updatedCategory = await this.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedCategory;
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  // Delete category (soft delete)
  async deleteCategory(id) {
    try {
      const category = await this.getById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category has subcategories
      const subcategories = await this.findBy('parentId', id);
      if (subcategories.length > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      await this.update(id, {
        isActive: false,
        updatedAt: new Date()
      });

      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree() {
    try {
      const allCategories = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        sortBy: 'name',
        sortOrder: 'asc'
      });

      // Build tree structure
      const categoryMap = new Map();
      const rootCategories = [];

      // First pass: create map of all categories
      allCategories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Second pass: build tree structure
      allCategories.forEach(category => {
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryMap.get(category.id));
          }
        } else {
          rootCategories.push(categoryMap.get(category.id));
        }
      });

      return rootCategories;
    } catch (error) {
      throw new Error(`Error getting category tree: ${error.message}`);
    }
  }

  // Get subcategories of a category
  async getSubcategories(parentId) {
    try {
      return await this.findBy('parentId', parentId, {
        filters: [{ field: 'isActive', operator: '==', value: true }],
        sortBy: 'name',
        sortOrder: 'asc'
      });
    } catch (error) {
      throw new Error(`Error getting subcategories: ${error.message}`);
    }
  }

  // Get category path (breadcrumb)
  async getCategoryPath(categoryId) {
    try {
      const path = [];
      let currentCategory = await this.getById(categoryId);

      while (currentCategory) {
        path.unshift(currentCategory);
        if (currentCategory.parentId) {
          currentCategory = await this.getById(currentCategory.parentId);
        } else {
          break;
        }
      }

      return path;
    } catch (error) {
      throw new Error(`Error getting category path: ${error.message}`);
    }
  }

  // Search categories
  async searchCategories(searchTerm, options = {}) {
    try {
      const categories = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });
      
      const searchLower = searchTerm.toLowerCase();
      const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower)
      );

      return filteredCategories;
    } catch (error) {
      throw new Error(`Error searching categories: ${error.message}`);
    }
  }

  // Get category statistics
  async getCategoryStats(categoryId) {
    try {
      const category = await this.getById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Get all subcategories recursively
      const getAllSubcategoryIds = async (parentId) => {
        const subcategories = await this.findBy('parentId', parentId);
        let ids = [parentId];
        
        for (const subcategory of subcategories) {
          const subIds = await getAllSubcategoryIds(subcategory.id);
          ids = ids.concat(subIds);
        }
        
        return ids;
      };

      const categoryIds = await getAllSubcategoryIds(categoryId);

      // Note: This would need to be implemented with product service integration
      // For now, returning basic category info
      return {
        categoryId,
        categoryName: category.name,
        totalSubcategories: categoryIds.length - 1, // Exclude self
        // Additional stats would be calculated here
      };
    } catch (error) {
      throw new Error(`Error getting category stats: ${error.message}`);
    }
  }
}

module.exports = CategoryService;
