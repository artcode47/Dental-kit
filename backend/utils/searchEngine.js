const natural = require('natural');
const ProductService = require('../services/productService');
const UserService = require('../services/userService');
const CategoryService = require('../services/categoryService');
const OrderService = require('../services/orderService'); // Added OrderService import

const productService = new ProductService();
const userService = new UserService();
const categoryService = new CategoryService();
const orderService = new OrderService(); // Initialize OrderService

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Search index for products
const searchIndex = new Map();

// Initialize search index
const initializeSearchIndex = async () => {
  try {
    // Use simplified query approach
    let q = productService.collectionRef.where('isActive', '==', true);
    q = q.limit(1000);
    
    const querySnapshot = await q.get();
    const products = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const convertedData = productService.convertTimestamps(data);
      products.push({
        id: doc.id,
        ...convertedData
      });
    });

    products.forEach(product => {
      const searchableText = [
        product.name,
        product.description,
        product.shortDescription,
        product.brand,
        product.categoryName,
        product.vendorName,
        ...(product.tags || []),
        ...(product.searchKeywords || [])
      ].join(' ').toLowerCase();

      const tokens = tokenizer.tokenize(searchableText);
      const stems = tokens.map(token => stemmer.stem(token));

      searchIndex.set(product.id, {
        product,
        tokens: new Set(tokens),
        stems: new Set(stems),
        searchableText
      });
    });

    console.log(`Search index initialized with ${products.length} products`);
  } catch (error) {
    console.error('Error initializing search index:', error);
  }
};

// Update search index for a single product
const updateProductInIndex = async (productId) => {
  try {
    const product = await productService.getProductById(productId);

    if (!product) {
      searchIndex.delete(productId);
      return;
    }

    const searchableText = [
      product.name,
      product.description,
      product.shortDescription,
      product.brand,
      product.categoryName,
      product.vendorName,
      ...(product.tags || []),
      ...(product.searchKeywords || [])
    ].join(' ').toLowerCase();

    const tokens = tokenizer.tokenize(searchableText);
    const stems = tokens.map(token => stemmer.stem(token));

    searchIndex.set(product.id, {
      product,
      tokens: new Set(tokens),
      stems: new Set(stems),
      searchableText
    });
  } catch (error) {
    console.error('Error updating product in search index:', error);
  }
};

// Advanced search function
const advancedSearch = async (query, filters = {}, userId = null) => {
  try {
    const {
      category,
      vendor,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      inStock,
      isOnSale,
      isFeatured,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters;

    // Build search filters
    const searchFilters = { isActive: true };
    if (category) searchFilters.categoryId = category;
    if (vendor) searchFilters.vendorId = vendor;
    if (minPrice !== undefined) searchFilters.minPrice = minPrice;
    if (maxPrice !== undefined) searchFilters.maxPrice = maxPrice;
    if (inStock !== undefined) searchFilters.inStock = inStock;
    if (isOnSale !== undefined) searchFilters.isOnSale = isOnSale;
    if (isFeatured !== undefined) searchFilters.isFeatured = isFeatured;

    // Get products from Firebase
    const products = await productService.getAll({
      filters: searchFilters,
      sortBy,
      sortOrder,
      limitCount: limit * 10
    });

    // Apply text search if query provided
    let searchResults = products;
    if (query && query.trim()) {
      const queryTokens = tokenizer.tokenize(query.toLowerCase());
      const queryStems = queryTokens.map(token => stemmer.stem(token));

      searchResults = products.filter(product => {
        const indexEntry = searchIndex.get(product.id);
        if (!indexEntry) return false;

        // Check for exact matches
        const hasExactMatch = queryTokens.some(token => 
          indexEntry.tokens.has(token)
        );

        // Check for stemmed matches
        const hasStemMatch = queryStems.some(stem => 
          indexEntry.stems.has(stem)
        );

        return hasExactMatch || hasStemMatch;
      });

      // Sort by relevance
      searchResults.sort((a, b) => {
        const aEntry = searchIndex.get(a.id);
        const bEntry = searchIndex.get(b.id);
        
        if (!aEntry || !bEntry) return 0;

        const aScore = calculateRelevanceScore(aEntry, queryTokens, queryStems);
        const bScore = calculateRelevanceScore(bEntry, queryTokens, queryStems);
        
        return bScore - aScore;
      });
    }

    // Apply rating filter
    if (minRating !== undefined || maxRating !== undefined) {
      searchResults = searchResults.filter(product => {
        const rating = product.averageRating || 0;
        if (minRating !== undefined && rating < minRating) return false;
        if (maxRating !== undefined && rating > maxRating) return false;
        return true;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    // Track search for recommendations
    if (userId && query) {
      await trackSearch(userId, query, searchResults.map(p => p.id));
    }

    return {
      products: paginatedResults,
      total: searchResults.length,
      page,
      limit,
      totalPages: Math.ceil(searchResults.length / limit)
    };

  } catch (error) {
    console.error('Error in advanced search:', error);
    throw error;
  }
};

// Calculate relevance score for search results
const calculateRelevanceScore = (indexEntry, queryTokens, queryStems) => {
  let score = 0;

  // Exact token matches (higher weight)
  queryTokens.forEach(token => {
    if (indexEntry.tokens.has(token)) {
      score += 10;
    }
  });

  // Stemmed matches (lower weight)
  queryStems.forEach(stem => {
    if (indexEntry.stems.has(stem)) {
      score += 5;
    }
  });

  // Boost score for products with higher ratings
  if (indexEntry.product.averageRating) {
    score += indexEntry.product.averageRating * 2;
  }

  // Boost score for featured products
  if (indexEntry.product.isFeatured) {
    score += 5;
  }

  return score;
};

// Get search suggestions
const getSearchSuggestions = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const suggestions = new Set();

    // Get products that match the query
    const products = await productService.getAll({
      filters: { isActive: true },
      limitCount: 100
    });

    products.forEach(product => {
      const searchableText = [
        product.name,
        product.brand,
        product.categoryName,
        ...(product.tags || [])
      ].join(' ').toLowerCase();

      // Find matching words
      const words = searchableText.split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(queryLower) && word.length > queryLower.length) {
          suggestions.add(word);
        }
      });
    });

    // Get categories that match
    const categories = await categoryService.getAll({
      filters: { isActive: true },
      limitCount: 50
    });

    categories.forEach(category => {
      if (category.name.toLowerCase().includes(queryLower)) {
        suggestions.add(category.name);
      }
    });

    return Array.from(suggestions).slice(0, limit);

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

// Get popular searches
const getPopularSearches = async (limit = 10) => {
  try {
    // This would typically come from a search analytics collection
    // For now, return some default popular searches
    const popularSearches = [
      'dental floss',
      'toothbrush',
      'mouthwash',
      'toothpaste',
      'dental kit',
      'oral hygiene',
      'dental care',
      'teeth whitening',
      'dental tools',
      'oral health'
    ];

    return popularSearches.slice(0, limit);

  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
};

// Get product recommendations for user
const getProductRecommendations = async (userId, limit = 10) => {
  try {
    const user = await userService.getById(userId);
    if (!user) {
      return [];
    }

    // Get user's recent orders
    const recentOrders = await orderService.getUserOrders(userId, { limit: 5 });
    
    // Extract product IDs from recent orders
    const recentProductIds = new Set();
    recentOrders.orders.forEach(order => {
      order.items.forEach(item => {
        recentProductIds.add(item.productId);
      });
    });

    // Get products from same categories as recent purchases
    const recommendations = [];
    for (const productId of recentProductIds) {
      const product = await productService.getProductById(productId);
      if (product && product.categoryId) {
        const similarProducts = await productService.getProductsByCategory(product.categoryId, {
          limitCount: 5
        });
        
        similarProducts.forEach(similarProduct => {
          if (similarProduct.id !== productId && !recentProductIds.has(similarProduct.id)) {
            recommendations.push(similarProduct);
          }
        });
      }
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    return uniqueRecommendations.slice(0, limit);

  } catch (error) {
    console.error('Error getting product recommendations:', error);
    return [];
  }
};

// Track search for analytics
const trackSearch = async (userId, query, productIds) => {
  try {
    // Update user's search history
    await userService.update(userId, {
      $push: {
        searchHistory: {
          query,
          productIds,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
};

// Export functions
module.exports = {
  initializeSearchIndex,
  updateProductInIndex,
  advancedSearch,
  getSearchSuggestions,
  getPopularSearches,
  getProductRecommendations,
  trackSearch
}; 