import api from './api';
import { toast } from 'react-hot-toast';

class EcommerceService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.pendingRequests = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Generate cache key
  getCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
  }

  // Get from cache
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Debounced request to prevent duplicate calls
  async debouncedRequest(endpoint, params = {}, options = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }
    // Create new request
    const requestPromise = this.makeRequest(endpoint, params, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      this.setCache(cacheKey, result);
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Make request with retry logic
  async makeRequest(endpoint, params = {}, options = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await api.get(endpoint, { params });
        
        // Handle both response formats: wrapped and direct
        if (response.data) {
          // If response has success property, it's wrapped
          if (response.data.hasOwnProperty('success')) {
            if (response.data.success) {
              return response.data.data;
            } else {
              throw new Error(response.data.message || 'Request failed');
            }
          } else {
            // Direct response format (like the products API)
            return response.data;
          }
        } else {
          throw new Error('No data in response');
        }
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }

        // Retry on server errors (5xx) or network errors
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    // All retries failed
    console.error(`❌ Request failed after ${this.maxRetries + 1} attempts:`, lastError);
    throw lastError;
  }

  // PRODUCTS
  async getProducts(options = {}) {
    try {
      const result = await this.debouncedRequest('/products', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      toast.error('Failed to load products. Please try again.');
      throw error;
    }
  }

  async getProductById(id, options = {}) {
    try {
      const cacheKey = `product_${id}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached && !options.forceRefresh) {
        return cached;
      }

      const result = await this.debouncedRequest(`/products/${id}`, {}, options);
      
      // Extract product data from response
      const productData = result.product || result;
      
      this.setCache(cacheKey, productData);
      return productData;
    } catch (error) {
      console.error(`❌ Failed to fetch product ${id}:`, error);
      toast.error('Failed to load product details. Please try again.');
      throw error;
    }
  }

  async searchProducts(query, options = {}) {
    try {
      const result = await this.debouncedRequest('/products/search', { 
        q: query, 
        ...options 
      });
      return result;
    } catch (error) {
      console.error('❌ Failed to search products:', error);
      toast.error('Search failed. Please try again.');
      throw error;
    }
  }

  async getProductsByCategory(categorySlugOrId, options = {}) {
    try {
      const result = await this.debouncedRequest(`/categories/${categorySlugOrId}/products`, options);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch products for category ${categorySlugOrId}:`, error);
      toast.error('Failed to load category products. Please try again.');
      throw error;
    }
  }

  async getProductsByVendor(vendorId, options = {}) {
    try {
      const result = await this.debouncedRequest(`/vendors/${vendorId}/products`, options);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch products for vendor ${vendorId}:`, error);
      toast.error('Failed to load vendor products. Please try again.');
      throw error;
    }
  }

  async getFeaturedProducts(options = {}) {
    try {
      const result = await this.debouncedRequest('/products/featured', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch featured products:', error);
      return { products: [] };
    }
  }

  async getNewArrivals(options = {}) {
    try {
      const result = await this.debouncedRequest('/products/new-arrivals', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch new arrivals:', error);
      return { products: [] };
    }
  }

  async getSaleProducts(options = {}) {
    try {
      const result = await this.debouncedRequest('/products/sale', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch sale products:', error);
      return { products: [] };
    }
  }

  async getRelatedProducts(productId, options = {}) {
    try {
      const result = await this.debouncedRequest(`/products/${productId}/related`, options);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch related products for ${productId}:`, error);
      return { products: [] };
    }
  }

  // CATEGORIES
  async getCategories(options = {}) {
    try {
      const result = await this.debouncedRequest('/categories', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      return { categories: [] };
    }
  }

  async getCategoryById(id) {
    try {
      const cacheKey = `category_${id}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const result = await this.debouncedRequest(`/categories/${id}`);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  // VENDORS
  async getVendors(options = {}) {
    try {
      const result = await this.debouncedRequest('/vendors', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch vendors:', error);
      return { vendors: [] };
    }
  }

  async getVendorById(id) {
    try {
      const cacheKey = `vendor_${id}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const result = await this.debouncedRequest(`/vendors/${id}`);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch vendor ${id}:`, error);
      throw error;
    }
  }

  // CART
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data || null;
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error);
      return null;
    }
  }

  async addToCart(productId, quantity = 1, variantId = null) {
    try {
      const response = await api.post('/cart/add', {
        productId,
        quantity,
        variantId
      });
      
      // Invalidate cart cache
      this.clearCache('cart');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      
      // Invalidate cart cache
      this.clearCache('cart');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update cart item:', error);
      throw error;
    }
  }

  async removeFromCart(itemId) {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      
      // Invalidate cart cache
      this.clearCache('cart');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to remove from cart:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      const response = await api.delete('/cart/clear');
      
      // Invalidate cart cache
      this.clearCache('cart');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      throw error;
    }
  }

  // ORDERS
  async getOrders(options = {}) {
    try {
      const result = await this.debouncedRequest('/orders', options);
      return result;
    } catch (error) {
      // Gracefully handle 404 or missing endpoint by returning empty dataset
      const status = error?.response?.status;
      if (status === 404) {
        console.warn('⚠️ Orders endpoint not found. Returning empty list.');
        return { orders: [], total: 0, totalPages: 1, currentPage: 1 };
      }
      console.error('❌ Failed to fetch orders:', error);
      toast.error('Failed to load orders. Please try again.');
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const cacheKey = `order_${id}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const result = await this.debouncedRequest(`/orders/${id}`);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch order ${id}:`, error);
      toast.error('Failed to load order details. Please try again.');
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      
      // Invalidate orders cache
      this.clearCache('orders');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId, reason) {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
      
      // Invalidate order cache
      this.clearCache(`order_${orderId}`);
      this.clearCache('orders');
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  }

  // WISHLIST
  async getWishlist(options = {}) {
    try {
      const result = await this.debouncedRequest('/users/wishlist', options);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch wishlist:', error);
      return { items: [] };
    }
  }

  async addToWishlist(productId) {
    try {
      const response = await api.post('/products/wishlist', { productId });
      
      // Invalidate wishlist cache
      this.clearCache('wishlist');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to add to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(productId) {
    try {
      const response = await api.delete(`/products/wishlist/${productId}`);
      
      // Invalidate wishlist cache
      this.clearCache('wishlist');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to remove from wishlist:', error);
      throw error;
    }
  }

  // REVIEWS
  async getProductReviews(productId, options = {}) {
    try {
      const result = await this.debouncedRequest(`/products/${productId}/reviews`, options);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch reviews for product ${productId}:`, error);
      return { reviews: [] };
    }
  }

  async createReview(productId, reviewData) {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      
      // Invalidate reviews cache
      this.clearCache(`reviews_${productId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create review for product ${productId}:`, error);
      throw error;
    }
  }

  // COUPONS
  async validateCoupon(code) {
    try {
      const response = await api.post('/coupons/validate', { code });
      return response.data || null;
    } catch (error) {
      console.error('❌ Failed to validate coupon:', error);
      return null;
    }
  }

  // SEARCH
  async getSearchSuggestions(query) {
    try {
      const result = await this.debouncedRequest('/search/suggestions', { q: query });
      return result;
    } catch (error) {
      console.error('❌ Failed to get search suggestions:', error);
      return { suggestions: [] };
    }
  }

  async getPopularSearches() {
    try {
      const result = await this.debouncedRequest('/search/popular');
      return result;
    } catch (error) {
      console.error('❌ Failed to get popular searches:', error);
      return { searches: [] };
    }
  }

  // PERFORMANCE MONITORING
  async getPerformanceMetrics() {
    try {
      const response = await api.get('/performance');
      return response.data || null;
    } catch (error) {
      console.error('❌ Failed to get performance metrics:', error);
      return null;
    }
  }

  // CACHE MANAGEMENT
  clearAllCaches() {
    this.cache.clear();
    console.log('✅ All caches cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Preload critical data (idempotent - only runs once)
  async preloadCriticalData() {
    // Check if already preloaded or currently preloading
    if (this._preloadPromise || this._preloadCompleted) {
      console.log('🔄 Preload already in progress or completed, returning existing promise');
      return this._preloadPromise || Promise.resolve();
    }

    console.log('🚀 Preloading critical data...');
    
    this._preloadPromise = (async () => {
      try {
        const promises = [
          this.getCategories(),
          this.getFeaturedProducts(),
          this.getNewArrivals()
        ];

        await Promise.allSettled(promises);
        this._preloadCompleted = true;
        console.log('✅ Critical data preloaded');
      } catch (error) {
        console.error('❌ Failed to preload critical data:', error);
        this._preloadPromise = null; // Allow retry on error
        throw error;
      }
    })();

    return this._preloadPromise;
  }

  // Cleanup
  cleanup() {
    this.clearAllCaches();
    this.pendingRequests.clear();
    this.retryAttempts.clear();
  }
}

// Create singleton instance
const ecommerceService = new EcommerceService();

export default ecommerceService;
