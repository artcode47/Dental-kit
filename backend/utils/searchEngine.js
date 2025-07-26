const natural = require('natural');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Search index for products
const searchIndex = new Map();

// Initialize search index
const initializeSearchIndex = async () => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('vendor', 'name');

    products.forEach(product => {
      const searchableText = [
        product.name,
        product.description,
        product.shortDescription,
        product.brand,
        product.category?.name,
        product.vendor?.name,
        ...(product.tags || []),
        ...(product.searchKeywords || [])
      ].join(' ').toLowerCase();

      const tokens = tokenizer.tokenize(searchableText);
      const stems = tokens.map(token => stemmer.stem(token));

      searchIndex.set(product._id.toString(), {
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
    const product = await Product.findById(productId)
      .populate('category', 'name')
      .populate('vendor', 'name');

    if (!product) {
      searchIndex.delete(productId.toString());
      return;
    }

    const searchableText = [
      product.name,
      product.description,
      product.shortDescription,
      product.brand,
      product.category?.name,
      product.vendor?.name,
      ...(product.tags || []),
      ...(product.searchKeywords || [])
    ].join(' ').toLowerCase();

    const tokens = tokenizer.tokenize(searchableText);
    const stems = tokens.map(token => stemmer.stem(token));

    searchIndex.set(product._id.toString(), {
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

    // Tokenize and stem the search query
    const queryTokens = tokenizer.tokenize(query.toLowerCase());
    const queryStems = queryTokens.map(token => stemmer.stem(token));

    // Score products based on search relevance
    const scoredProducts = [];

    for (const [productId, indexData] of searchIndex) {
      const { product, tokens, stems } = indexData;

      // Skip if product is not active
      if (!product.isActive) continue;

      // Apply filters
      if (category && product.category.toString() !== category) continue;
      if (vendor && product.vendor.toString() !== vendor) continue;
      if (minPrice && product.price < minPrice) continue;
      if (maxPrice && product.price > maxPrice) continue;
      if (minRating && product.averageRating < minRating) continue;
      if (maxRating && product.averageRating > maxRating) continue;
      if (inStock && product.stock === 0) continue;
      if (isOnSale && !product.isOnSale) continue;
      if (isFeatured && !product.isFeatured) continue;

      // Calculate relevance score
      let score = 0;

      // Exact matches get highest score
      queryTokens.forEach(token => {
        if (tokens.has(token)) score += 10;
        if (product.name.toLowerCase().includes(token)) score += 15;
        if (product.brand && product.brand.toLowerCase().includes(token)) score += 12;
      });

      // Stemmed matches
      queryStems.forEach(stem => {
        if (stems.has(stem)) score += 5;
      });

      // Partial matches
      queryTokens.forEach(token => {
        if (token.length > 2) {
          for (const productToken of tokens) {
            if (productToken.includes(token) || token.includes(productToken)) {
              score += 2;
            }
          }
        }
      });

      // Boost popular products
      score += Math.log(product.views + 1) * 0.5;
      score += Math.log(product.totalSold + 1) * 0.3;
      score += product.averageRating * 0.2;

      if (score > 0) {
        scoredProducts.push({
          product,
          score
        });
      }
    }

    // Sort products
    if (sortBy === 'relevance') {
      scoredProducts.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'price') {
      scoredProducts.sort((a, b) => {
        return sortOrder === 'asc' ? a.product.price - b.product.price : b.product.price - a.product.price;
      });
    } else if (sortBy === 'rating') {
      scoredProducts.sort((a, b) => {
        return sortOrder === 'asc' ? a.product.averageRating - b.product.averageRating : b.product.averageRating - a.product.averageRating;
      });
    } else if (sortBy === 'newest') {
      scoredProducts.sort((a, b) => {
        return sortOrder === 'asc' ? a.product.createdAt - b.product.createdAt : b.product.createdAt - a.product.createdAt;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = scoredProducts.slice(startIndex, endIndex);

    // Update user search history if userId provided
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          searchHistory: {
            query,
            timestamp: new Date()
          }
        }
      });
    }

    return {
      products: paginatedProducts.map(item => item.product),
      total: scoredProducts.length,
      totalPages: Math.ceil(scoredProducts.length / limit),
      currentPage: page,
      hasNextPage: endIndex < scoredProducts.length,
      hasPrevPage: page > 1
    };

  } catch (error) {
    console.error('Error in advanced search:', error);
    throw error;
  }
};

// Get search suggestions
const getSearchSuggestions = async (query, limit = 10) => {
  try {
    const suggestions = new Set();
    const queryLower = query.toLowerCase();

    // Get suggestions from product names
    const products = await Product.find({
      name: { $regex: queryLower, $options: 'i' },
      isActive: true
    }).limit(limit);

    products.forEach(product => {
      suggestions.add(product.name);
    });

    // Get suggestions from categories
    const categories = await Category.find({
      name: { $regex: queryLower, $options: 'i' }
    }).limit(limit);

    categories.forEach(category => {
      suggestions.add(category.name);
    });

    // Get suggestions from brands
    const brands = await Product.distinct('brand', {
      brand: { $regex: queryLower, $options: 'i' },
      isActive: true
    });

    brands.forEach(brand => {
      if (brand) suggestions.add(brand);
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
    const popularSearches = await User.aggregate([
      { $unwind: '$searchHistory' },
      {
        $group: {
          _id: '$searchHistory.query',
          count: { $sum: 1 },
          lastSearched: { $max: '$searchHistory.timestamp' }
        }
      },
      { $sort: { count: -1, lastSearched: -1 } },
      { $limit: limit }
    ]);

    return popularSearches.map(item => ({
      query: item._id,
      count: item.count,
      lastSearched: item.lastSearched
    }));
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
};

// Product recommendations based on user behavior
const getProductRecommendations = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId)
      .populate('recentlyViewed.product')
      .populate('searchHistory');

    if (!user) return [];

    const recommendations = new Map();

    // Based on recently viewed products
    const recentlyViewedCategories = new Set();
    const recentlyViewedVendors = new Set();

    user.recentlyViewed.forEach(item => {
      if (item.product) {
        recentlyViewedCategories.add(item.product.category.toString());
        recentlyViewedVendors.add(item.product.vendor.toString());
      }
    });

    // Find similar products
    const similarProducts = await Product.find({
      isActive: true,
      $or: [
        { category: { $in: Array.from(recentlyViewedCategories) } },
        { vendor: { $in: Array.from(recentlyViewedVendors) } }
      ],
      _id: { $nin: user.recentlyViewed.map(item => item.product?._id).filter(Boolean) }
    })
    .populate('category', 'name')
    .populate('vendor', 'name')
    .limit(limit * 2);

    // Score recommendations
    similarProducts.forEach(product => {
      let score = 0;

      if (recentlyViewedCategories.has(product.category.toString())) score += 5;
      if (recentlyViewedVendors.has(product.vendor.toString())) score += 3;
      score += product.averageRating * 2;
      score += Math.log(product.views + 1);

      recommendations.set(product._id.toString(), { product, score });
    });

    // Sort by score and return top recommendations
    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

  } catch (error) {
    console.error('Error getting product recommendations:', error);
    return [];
  }
};

// Initialize search index on startup
initializeSearchIndex();

module.exports = {
  advancedSearch,
  getSearchSuggestions,
  getPopularSearches,
  getProductRecommendations,
  updateProductInIndex,
  initializeSearchIndex
}; 