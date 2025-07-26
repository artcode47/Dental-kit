require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-website-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.CLIENT_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock email sending
jest.mock('../utils/email', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true)
}));

// Mock Cloudinary
jest.mock('../utils/cloudinary', () => ({
  uploadMultipleImages: jest.fn().mockResolvedValue([
    { public_id: 'test-public-id', url: 'https://test-url.com/image.jpg' }
  ]),
  deleteMultipleImages: jest.fn().mockResolvedValue(true)
}));

// Mock audit logger
jest.mock('../utils/auditLogger', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Global test utilities
global.testUtils = {
  createTestUser: async (User, userData = {}) => {
    return await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      isVerified: true,
      ...userData
    });
  },

  createTestProduct: async (Product, productData = {}) => {
    return await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 50,
      sku: 'TEST-001',
      slug: 'test-product',
      category: new (require('mongoose')).Types.ObjectId(),
      vendor: new (require('mongoose')).Types.ObjectId(),
      ...productData
    });
  },

  generateAuthToken: (userId) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: userId }, process.env.JWT_SECRET);
  },

  cleanupDatabase: async () => {
    const mongoose = require('mongoose');
    const collections = Object.keys(mongoose.connection.collections);
    
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  }
};

// Before all tests
beforeAll(async () => {
  // Connect to test database
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// After all tests
afterAll(async () => {
  const mongoose = require('mongoose');
  await mongoose.connection.close();
});

// Before each test
beforeEach(async () => {
  await global.testUtils.cleanupDatabase();
});

// After each test
afterEach(async () => {
  jest.clearAllMocks();
}); 