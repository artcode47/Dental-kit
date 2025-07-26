const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const { advancedSearch, getSearchSuggestions, getPopularSearches } = require('../utils/searchEngine');

describe('Search Engine Tests', () => {
  let testUser, testCategory, testVendor, testProducts, authToken;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      isVerified: true
    });

    // Create test category
    testCategory = await Category.create({
      name: 'Dental Tools',
      slug: 'dental-tools',
      description: 'Professional dental tools'
    });

    // Create test vendor
    testVendor = await Vendor.create({
      name: 'Dental Pro',
      slug: 'dental-pro',
      email: 'contact@dentalpro.com',
      description: 'Professional dental equipment supplier'
    });

    // Create test products
    testProducts = await Product.create([
      {
        name: 'Professional Dental Mirror',
        description: 'High-quality dental mirror for professional use',
        shortDescription: 'Professional dental mirror',
        price: 25.99,
        stock: 100,
        sku: 'DM-001',
        slug: 'professional-dental-mirror',
        category: testCategory._id,
        vendor: testVendor._id,
        brand: 'DentalPro',
        tags: ['mirror', 'professional', 'dental'],
        searchKeywords: ['mirror', 'dental', 'professional'],
        isActive: true
      },
      {
        name: 'Dental Scaler Set',
        description: 'Complete set of dental scalers for plaque removal',
        shortDescription: 'Dental scaler set',
        price: 45.99,
        stock: 50,
        sku: 'DS-001',
        slug: 'dental-scaler-set',
        category: testCategory._id,
        vendor: testVendor._id,
        brand: 'DentalPro',
        tags: ['scaler', 'plaque', 'dental'],
        searchKeywords: ['scaler', 'dental', 'plaque'],
        isActive: true
      },
      {
        name: 'LED Dental Light',
        description: 'Bright LED light for dental procedures',
        shortDescription: 'LED dental light',
        price: 199.99,
        stock: 25,
        sku: 'DL-001',
        slug: 'led-dental-light',
        category: testCategory._id,
        vendor: testVendor._id,
        brand: 'DentalPro',
        tags: ['light', 'LED', 'dental'],
        searchKeywords: ['light', 'LED', 'dental'],
        isActive: true
      }
    ]);

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Vendor.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Advanced Search Function', () => {
    test('should find products by name', async () => {
      const result = await advancedSearch('dental mirror', {}, testUser._id);
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Professional Dental Mirror');
      expect(result.total).toBe(1);
    });

    test('should find products by description', async () => {
      const result = await advancedSearch('plaque removal', {}, testUser._id);
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Dental Scaler Set');
    });

    test('should find products by brand', async () => {
      const result = await advancedSearch('DentalPro', {}, testUser._id);
      
      expect(result.products).toHaveLength(3);
      expect(result.products.every(p => p.brand === 'DentalPro')).toBe(true);
    });

    test('should filter by price range', async () => {
      const result = await advancedSearch('dental', { minPrice: 30, maxPrice: 50 }, testUser._id);
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Dental Scaler Set');
    });

    test('should filter by category', async () => {
      const result = await advancedSearch('dental', { category: testCategory._id.toString() }, testUser._id);
      
      expect(result.products).toHaveLength(3);
      expect(result.products.every(p => p.category.toString() === testCategory._id.toString())).toBe(true);
    });

    test('should sort by price ascending', async () => {
      const result = await advancedSearch('dental', { sortBy: 'price', sortOrder: 'asc' }, testUser._id);
      
      expect(result.products[0].price).toBe(25.99);
      expect(result.products[1].price).toBe(45.99);
      expect(result.products[2].price).toBe(199.99);
    });

    test('should sort by price descending', async () => {
      const result = await advancedSearch('dental', { sortBy: 'price', sortOrder: 'desc' }, testUser._id);
      
      expect(result.products[0].price).toBe(199.99);
      expect(result.products[1].price).toBe(45.99);
      expect(result.products[2].price).toBe(25.99);
    });

    test('should paginate results', async () => {
      const result = await advancedSearch('dental', { page: 1, limit: 2 }, testUser._id);
      
      expect(result.products).toHaveLength(2);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
      expect(result.hasNextPage).toBe(true);
    });

    test('should return empty results for non-existent search', async () => {
      const result = await advancedSearch('nonexistent product', {}, testUser._id);
      
      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Search Suggestions', () => {
    test('should return suggestions for product names', async () => {
      const suggestions = await getSearchSuggestions('dental', 5);
      
      expect(suggestions).toContain('Professional Dental Mirror');
      expect(suggestions).toContain('Dental Scaler Set');
      expect(suggestions).toContain('LED Dental Light');
    });

    test('should return suggestions for categories', async () => {
      const suggestions = await getSearchSuggestions('dental', 5);
      
      expect(suggestions).toContain('Dental Tools');
    });

    test('should return suggestions for brands', async () => {
      const suggestions = await getSearchSuggestions('dental', 5);
      
      expect(suggestions).toContain('DentalPro');
    });

    test('should limit suggestions', async () => {
      const suggestions = await getSearchSuggestions('dental', 2);
      
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    test('should return empty array for no matches', async () => {
      const suggestions = await getSearchSuggestions('nonexistent', 5);
      
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('Popular Searches', () => {
    test('should return popular searches', async () => {
      // Add some search history
      await User.findByIdAndUpdate(testUser._id, {
        $push: {
          searchHistory: [
            { query: 'dental mirror', timestamp: new Date() },
            { query: 'dental mirror', timestamp: new Date() },
            { query: 'scaler', timestamp: new Date() }
          ]
        }
      });

      const popularSearches = await getPopularSearches(5);
      
      expect(popularSearches.length).toBeGreaterThan(0);
      expect(popularSearches[0].query).toBe('dental mirror');
      expect(popularSearches[0].count).toBe(2);
    });

    test('should limit popular searches', async () => {
      const popularSearches = await getPopularSearches(1);
      
      expect(popularSearches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Search API Endpoints', () => {
    test('GET /api/products/search should return search results', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({ q: 'dental mirror' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Professional Dental Mirror');
    });

    test('GET /api/products/search/suggestions should return suggestions', async () => {
      const response = await request(app)
        .get('/api/products/search/suggestions')
        .query({ q: 'dental' })
        .expect(200);

      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    test('GET /api/products/search/popular should return popular searches', async () => {
      const response = await request(app)
        .get('/api/products/search/popular')
        .expect(200);

      expect(response.body.popularSearches).toBeInstanceOf(Array);
    });

    test('GET /api/products/recommendations should return recommendations', async () => {
      const response = await request(app)
        .get('/api/products/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recommendations).toBeInstanceOf(Array);
    });

    test('GET /api/products/recommendations should require authentication', async () => {
      await request(app)
        .get('/api/products/recommendations')
        .expect(401);
    });
  });

  describe('Search Validation', () => {
    test('should require search query', async () => {
      await request(app)
        .get('/api/products/search')
        .query({})
        .expect(400);
    });

    test('should validate search query length', async () => {
      await request(app)
        .get('/api/products/search')
        .query({ q: '' })
        .expect(400);
    });

    test('should validate suggestion query', async () => {
      await request(app)
        .get('/api/products/search/suggestions')
        .query({})
        .expect(400);
    });
  });
}); 