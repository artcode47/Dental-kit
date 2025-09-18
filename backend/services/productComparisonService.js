const FirebaseService = require('./firebaseService');

class ProductComparisonService extends FirebaseService {
  constructor() {
    super('productComparisons');
  }

  // Create a new product comparison
  async createComparison(comparisonData) {
    try {
      const comparison = {
        ...comparisonData,
        isActive: true,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(comparison);
    } catch (error) {
      throw new Error(`Error creating product comparison: ${error.message}`);
    }
  }

  // Get all comparisons with filtering, sorting, and pagination
  async getComparisons(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoryId,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      let filters = [];

      if (categoryId) {
        filters.push({ field: 'categoryId', operator: '==', value: categoryId });
      }
      if (isActive !== undefined) {
        filters.push({ field: 'isActive', operator: '==', value: isActive });
      }

      const comparisons = await this.getAll({
        filters,
        sortBy,
        sortOrder,
        limitCount: limit
      });

      // Apply search filter if provided
      let filteredComparisons = comparisons;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredComparisons = comparisons.filter(comparison => 
          comparison.title.toLowerCase().includes(searchLower) ||
          comparison.description?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = filteredComparisons.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedComparisons = filteredComparisons.slice(startIndex, endIndex);

      return {
        comparisons: paginatedComparisons,
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
      throw new Error(`Error getting comparisons: ${error.message}`);
    }
  }

  // Get comparison by ID
  async getComparisonById(id) {
    try {
      const comparison = await this.getById(id);
      if (!comparison) {
        throw new Error('Product comparison not found');
      }
      return comparison;
    } catch (error) {
      throw new Error(`Error getting comparison: ${error.message}`);
    }
  }

  // Update comparison
  async updateComparison(id, updateData) {
    try {
      const comparison = await this.getById(id);
      if (!comparison) {
        throw new Error('Product comparison not found');
      }

      const updatedComparison = await this.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedComparison;
    } catch (error) {
      throw new Error(`Error updating comparison: ${error.message}`);
    }
  }

  // Delete comparison
  async deleteComparison(id) {
    try {
      const comparison = await this.getById(id);
      if (!comparison) {
        throw new Error('Product comparison not found');
      }

      await this.delete(id);
      return { message: 'Product comparison deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting comparison: ${error.message}`);
    }
  }

  // Get comparison by products
  async getComparisonByProducts(productIds) {
    try {
      if (!Array.isArray(productIds) || productIds.length < 2) {
        throw new Error('At least 2 product IDs are required');
      }

      const comparisons = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }]
      });

      // Find comparison that contains all the specified products
      const matchingComparison = comparisons.find(comparison => {
        const comparisonProductIds = comparison.products.map(p => p.productId);
        return productIds.every(id => comparisonProductIds.includes(id));
      });

      return matchingComparison || null;
    } catch (error) {
      throw new Error(`Error getting comparison by products: ${error.message}`);
    }
  }

  // Create comparison from product IDs
  async createComparisonFromProducts(productIds, title, description = '') {
    try {
      if (!Array.isArray(productIds) || productIds.length < 2) {
        throw new Error('At least 2 product IDs are required');
      }

      // Check if comparison already exists
      const existingComparison = await this.getComparisonByProducts(productIds);
      if (existingComparison) {
        return existingComparison;
      }

      const comparisonData = {
        title: title || `Comparison of ${productIds.length} products`,
        description,
        products: productIds.map(productId => ({
          productId,
          addedAt: new Date()
        })),
        categoryId: null, // This would be set based on the products
        isActive: true
      };

      return await this.createComparison(comparisonData);
    } catch (error) {
      throw new Error(`Error creating comparison from products: ${error.message}`);
    }
  }

  // Add product to comparison
  async addProductToComparison(comparisonId, productId) {
    try {
      const comparison = await this.getById(comparisonId);
      if (!comparison) {
        throw new Error('Product comparison not found');
      }

      // Check if product is already in comparison
      const existingProduct = comparison.products.find(p => p.productId === productId);
      if (existingProduct) {
        throw new Error('Product is already in this comparison');
      }

      const updatedProducts = [
        ...comparison.products,
        {
          productId,
          addedAt: new Date()
        }
      ];

      const updatedComparison = await this.update(comparisonId, {
        products: updatedProducts,
        updatedAt: new Date()
      });

      return updatedComparison;
    } catch (error) {
      throw new Error(`Error adding product to comparison: ${error.message}`);
    }
  }

  // Remove product from comparison
  async removeProductFromComparison(comparisonId, productId) {
    try {
      const comparison = await this.getById(comparisonId);
      if (!comparison) {
        throw new Error('Product comparison not found');
      }

      const updatedProducts = comparison.products.filter(p => p.productId !== productId);
      
      if (updatedProducts.length < 2) {
        throw new Error('Comparison must have at least 2 products');
      }

      const updatedComparison = await this.update(comparisonId, {
        products: updatedProducts,
        updatedAt: new Date()
      });

      return updatedComparison;
    } catch (error) {
      throw new Error(`Error removing product from comparison: ${error.message}`);
    }
  }

  // Increment view count
  async incrementViewCount(id) {
    try {
      const comparison = await this.getById(id);
      if (!comparison) {
        throw new Error('Product comparison not found');
      }

      const updatedComparison = await this.update(id, {
        viewCount: (comparison.viewCount || 0) + 1,
        updatedAt: new Date()
      });

      return updatedComparison;
    } catch (error) {
      throw new Error(`Error incrementing view count: ${error.message}`);
    }
  }

  // Get popular comparisons
  async getPopularComparisons(limit = 10) {
    try {
      const comparisons = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        sortBy: 'viewCount',
        sortOrder: 'desc',
        limitCount: limit
      });

      return comparisons;
    } catch (error) {
      throw new Error(`Error getting popular comparisons: ${error.message}`);
    }
  }

  // Get comparisons by category
  async getComparisonsByCategory(categoryId, options = {}) {
    try {
      return await this.getComparisons({
        categoryId,
        isActive: true,
        ...options
      });
    } catch (error) {
      throw new Error(`Error getting category comparisons: ${error.message}`);
    }
  }

  // Search comparisons
  async searchComparisons(searchTerm, options = {}) {
    try {
      const comparisons = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });
      
      const searchLower = searchTerm.toLowerCase();
      const filteredComparisons = comparisons.filter(comparison => 
        comparison.title.toLowerCase().includes(searchLower) ||
        comparison.description?.toLowerCase().includes(searchLower)
      );

      return filteredComparisons;
    } catch (error) {
      throw new Error(`Error searching comparisons: ${error.message}`);
    }
  }

  // Get comparison statistics
  async getComparisonStats() {
    try {
      const comparisons = await this.getAll();

      const stats = {
        total: comparisons.length,
        active: comparisons.filter(c => c.isActive).length,
        inactive: comparisons.filter(c => !c.isActive).length,
        totalViews: 0,
        averageProductsPerComparison: 0,
        byProductCount: {
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          '6+': 0
        }
      };

      if (comparisons.length > 0) {
        let totalProducts = 0;
        comparisons.forEach(comparison => {
          stats.totalViews += comparison.viewCount || 0;
          const productCount = comparison.products?.length || 0;
          totalProducts += productCount;
          
          if (productCount <= 5) {
            stats.byProductCount[productCount]++;
          } else {
            stats.byProductCount['6+']++;
          }
        });
        
        stats.averageProductsPerComparison = totalProducts / comparisons.length;
      }

      return stats;
    } catch (error) {
      throw new Error(`Error getting comparison stats: ${error.message}`);
    }
  }

  // Bulk comparison operations
  async bulkComparisonOperations(operation, comparisonIds, data = {}) {
    try {
      if (!operation || !comparisonIds || !Array.isArray(comparisonIds)) {
        throw new Error('Operation and comparison IDs array are required');
      }

      const updates = comparisonIds.map(id => ({ id, data: {} }));

      switch (operation) {
        case 'activate':
          updates.forEach(update => {
            update.data.isActive = true;
            update.data.updatedAt = new Date();
          });
          break;
        case 'deactivate':
          updates.forEach(update => {
            update.data.isActive = false;
            update.data.updatedAt = new Date();
          });
          break;
        case 'update':
          updates.forEach(update => {
            update.data = { ...data, updatedAt: new Date() };
          });
          break;
        case 'delete':
          await this.batchDelete(comparisonIds);
          return { message: `Bulk operation '${operation}' completed successfully` };
        default:
          throw new Error('Invalid operation');
      }

      await this.batchUpdate(updates);
      return { message: `Bulk operation '${operation}' completed successfully` };
    } catch (error) {
      throw new Error(`Error performing bulk comparison operations: ${error.message}`);
    }
  }
}

module.exports = ProductComparisonService;

