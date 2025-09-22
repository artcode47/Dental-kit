const FirebaseService = require('./firebaseService');
const unifiedStore = require('./unifiedStore');

class ProductService extends FirebaseService {
  constructor() {
    super('products');
    this.cacheTTL = 300; // 5 minutes
    this.searchCacheTTL = 60; // 1 minute for search results
  }

  // Enhanced caching methods
  async getCacheKey(operation, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `products:${operation}:${sortedParams}`;
  }

  async getFromCache(cacheKey) {
    try {
      return await unifiedStore.getCache(cacheKey);
    } catch (error) {
      console.warn('Cache read failed:', error.message);
      return null;
    }
  }

  async setCache(cacheKey, data, ttl = this.cacheTTL) {
    try {
      await unifiedStore.setCache(cacheKey, data, ttl);
    } catch (error) {
      console.warn('Cache write failed:', error.message);
    }
  }

  async invalidateCache(pattern = 'products:*') {
    try {
      await unifiedStore.clearCache(pattern);
    } catch (error) {
      console.warn('Cache invalidation failed:', error.message);
    }
  }

  // Create a new product with cache invalidation
  async createProduct(productData) {
    try {
      const product = {
        ...productData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.create(product);
      
      // Invalidate relevant caches
      await this.invalidateCache();
      
      return result;
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Optimized product retrieval with intelligent caching
  async getProducts(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        vendor,
        minPrice,
        maxPrice,
        inStock,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Generate cache key
      const cacheKey = await this.getCacheKey('getProducts', {
        page, limit, category, vendor, minPrice, maxPrice, inStock, search, sortBy, sortOrder
      });

      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch products with optimized query strategy
      const products = await this.fetchProductsOptimized(options);
      
      // Cache the result
      await this.setCache(cacheKey, products, this.cacheTTL);
      
      return products;
    } catch (error) {
      console.error('Products service error:', error);
      // Soft-fail structure to keep API stable
      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: options.page || 1,
        hasNextPage: false,
        hasPrevPage: false,
        diagnostics: { degraded: true, reason: error.message || 'unknown' }
      };
    }
  }

  // Optimized product fetching without composite indexes
  async fetchProductsOptimized(options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      vendor,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    try {
      // Start with basic query - only use simple equality filters
      let query = this.collectionRef.where('isActive', '==', true);
      
      // Apply only one equality filter to avoid composite index requirements
      if (category) {
        query = query.where('categoryId', '==', category);
      } else if (vendor) {
        query = query.where('vendorId', '==', vendor);
      }

      // Get a reasonable number of documents for in-memory processing
      const maxFetch = Math.min(limit * 3, 500); // Fetch up to 3x the limit, max 500
      query = query.limit(maxFetch);

      const querySnapshot = await query.get();
      let products = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        products.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply additional filters in memory (no composite index required)
      let filteredProducts = products;

      // Apply category filter if not already applied
      if (category && !query._query?.filters?.some(f => f.field === 'categoryId')) {
        filteredProducts = filteredProducts.filter(product => 
          product.categoryId === category
        );
      }

      // Apply vendor filter if not already applied
      if (vendor && !query._query?.filters?.some(f => f.field === 'vendorId')) {
        filteredProducts = filteredProducts.filter(product => 
          product.vendorId === vendor
        );
      }

      // Apply stock filter
      if (inStock !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          inStock ? (product.stock && product.stock > 0) : (!product.stock || product.stock <= 0)
        );
      }

      // Apply price filters
      if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price && product.price >= minPrice
        );
      }
      if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price && product.price <= maxPrice
        );
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          (product.name && product.name.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
          (product.sku && product.sku.toLowerCase().includes(searchLower))
        );
      }

      // Sort in memory
      filteredProducts.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Handle date objects
        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();
        
        // Handle undefined values
        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;
        
        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortOrder === 'asc' ? comparison : -comparison;
        }
        
        // Default comparison
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredProducts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID with caching
  async getProductById(id) {
    try {
      const cacheKey = await this.getCacheKey('getProductById', { id });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const product = await super.getById(id);
      
      if (product) {
        // Cache the product
        await this.setCache(cacheKey, product, this.cacheTTL * 2); // Longer cache for individual products
      }
      
      return product;
    } catch (error) {
      throw new Error(`Error getting product: ${error.message}`);
    }
  }

  // Enhanced search with caching
  async searchProducts(searchTerm, options = {}) {
    try {
      const cacheKey = await this.getCacheKey('searchProducts', { searchTerm, ...options });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use the optimized product fetching
      const searchOptions = { ...options, search: searchTerm };
      const result = await this.fetchProductsOptimized(searchOptions);
      
      // Cache search results with shorter TTL
      await this.setCache(cacheKey, result, this.searchCacheTTL);
      
      return result;
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Get products by category with caching
  async getProductsByCategory(categoryId, options = {}) {
    try {
      const cacheKey = await this.getCacheKey('getProductsByCategory', { categoryId, ...options });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.fetchProductsOptimized({ ...options, category: categoryId });
      
      // Cache the result
      await this.setCache(cacheKey, result, this.cacheTTL);
      
      return result;
    } catch (error) {
      throw new Error(`Error getting products by category: ${error.message}`);
    }
  }

  // Get products by vendor with caching
  async getProductsByVendor(vendorId, options = {}) {
    try {
      const cacheKey = await this.getCacheKey('getProductsByVendor', { vendorId, ...options });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.fetchProductsOptimized({ ...options, vendor: vendorId });
      
      // Cache the result
      await this.setCache(cacheKey, result, this.cacheTTL);
      
      return result;
    } catch (error) {
      throw new Error(`Error getting products by vendor: ${error.message}`);
    }
  }

  // Update product with cache invalidation
  async updateProduct(id, updateData) {
    try {
      const product = await super.update(id, updateData);
      
      // Invalidate relevant caches
      await this.invalidateCache();
      
      return product;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Update product stock by increasing or decreasing quantity
  async updateStock(productId, quantityDelta, operation = 'decrease') {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const currentStock = typeof product.stock === 'number' ? product.stock : 0;
      const delta = Math.abs(quantityDelta || 0);
      const change = operation === 'increase' ? delta : -delta;
      const newStock = Math.max(0, currentStock + change);

      const updated = await this.updateProduct(productId, {
        stock: newStock,
        updatedAt: new Date()
      });

      return updated;
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  }

  // Delete product with cache invalidation
  async deleteProduct(id) {
    try {
      const result = await super.delete(id);
      
      // Invalidate relevant caches
      await this.invalidateCache();
      
      return result;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Get featured products with caching
  async getFeaturedProducts(limit = 10) {
    try {
      const cacheKey = await this.getCacheKey('getFeaturedProducts', { limit });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch featured products
      const allProducts = await this.getAllSimple({ limitCount: 1000 });
      const featuredProducts = allProducts
        .filter(product => product.isFeatured && product.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

      // Cache the result
      await this.setCache(cacheKey, featuredProducts, this.cacheTTL);
      
      return featuredProducts;
    } catch (error) {
      throw new Error(`Error getting featured products: ${error.message}`);
    }
  }

  // Get new arrivals with caching
  async getNewArrivals(limit = 10) {
    try {
      const cacheKey = await this.getCacheKey('getNewArrivals', { limit });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch new arrivals
      const allProducts = await this.getAllSimple({ limitCount: 1000 });
      const newArrivals = allProducts
        .filter(product => product.isNew && product.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

      // Cache the result
      await this.setCache(cacheKey, newArrivals, this.cacheTTL);
      
      return newArrivals;
    } catch (error) {
      throw new Error(`Error getting new arrivals: ${error.message}`);
    }
  }

  // Get sale products with caching
  async getSaleProducts(limit = 10) {
    try {
      const cacheKey = await this.getCacheKey('getSaleProducts', { limit });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch sale products
      const allProducts = await this.getAllSimple({ limitCount: 1000 });
      const saleProducts = allProducts
        .filter(product => product.isOnSale && product.isActive)
        .sort((a, b) => (b.salePercentage || 0) - (a.salePercentage || 0))
        .slice(0, limit);

      // Cache the result
      await this.setCache(cacheKey, saleProducts, this.cacheTTL);
      
      return saleProducts;
    } catch (error) {
      throw new Error(`Error getting sale products: ${error.message}`);
    }
  }

  // Get related products with caching
  async getRelatedProducts(productId, limit = 6) {
    try {
      const cacheKey = await this.getCacheKey('getRelatedProducts', { productId, limit });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get current product to find related ones
      const currentProduct = await this.getProductById(productId);
      if (!currentProduct) {
        return [];
      }

      // Fetch related products based on category and brand
      const allProducts = await this.getAllSimple({ limitCount: 1000 });
      const relatedProducts = allProducts
        .filter(product => 
          product.id !== productId && 
          product.isActive &&
          (product.categoryId === currentProduct.categoryId || 
           product.brand === currentProduct.brand)
        )
        .sort((a, b) => {
          // Prioritize same category and brand
          const aScore = (a.categoryId === currentProduct.categoryId ? 2 : 0) + 
                        (a.brand === currentProduct.brand ? 1 : 0);
          const bScore = (b.categoryId === currentProduct.categoryId ? 2 : 0) + 
                        (b.brand === currentProduct.brand ? 1 : 0);
          return bScore - aScore;
        })
        .slice(0, limit);

      // Cache the result
      await this.setCache(cacheKey, relatedProducts, this.cacheTTL);
      
      return relatedProducts;
    } catch (error) {
      throw new Error(`Error getting related products: ${error.message}`);
    }
  }

  // Get product statistics with caching
  async getProductStats() {
    try {
      const cacheKey = await this.getCacheKey('getProductStats');
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch all products for statistics
      const allProducts = await this.getAllSimple({ limitCount: 10000 });
      
      const stats = {
        total: allProducts.length,
        active: allProducts.filter(p => p.isActive).length,
        inactive: allProducts.filter(p => !p.isActive).length,
        inStock: allProducts.filter(p => p.stock > 0).length,
        outOfStock: allProducts.filter(p => p.stock <= 0).length,
        onSale: allProducts.filter(p => p.isOnSale).length,
        featured: allProducts.filter(p => p.isFeatured).length,
        new: allProducts.filter(p => p.isNew).length,
        categories: {},
        brands: {},
        priceRanges: {
          under10: allProducts.filter(p => p.price < 10).length,
          under25: allProducts.filter(p => p.price < 25).length,
          under50: allProducts.filter(p => p.price < 50).length,
          under100: allProducts.filter(p => p.price < 100).length,
          over100: allProducts.filter(p => p.price >= 100).length
        }
      };

      // Count by category
      allProducts.forEach(product => {
        if (product.categoryId) {
          stats.categories[product.categoryId] = (stats.categories[product.categoryId] || 0) + 1;
        }
        if (product.brand) {
          stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
        }
      });

      // Cache the result with longer TTL
      await this.setCache(cacheKey, stats, this.cacheTTL * 4);
      
      return stats;
    } catch (error) {
      throw new Error(`Error getting product stats: ${error.message}`);
    }
  }

  // Clear all product caches
  async clearAllCaches() {
    try {
      await this.invalidateCache('products:*');
      console.log('✅ All product caches cleared');
    } catch (error) {
      console.error('❌ Error clearing product caches:', error);
    }
  }
}

module.exports = ProductService;
