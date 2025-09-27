const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_IMAGE_PATH = path.join(__dirname, '../test-images');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create test images directory and sample images
function createTestImages() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    fs.mkdirSync(TEST_IMAGE_PATH, { recursive: true });
  }
  
  // Create simple test images (1x1 pixel PNGs)
  const samplePNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8E, 0x64, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(path.join(TEST_IMAGE_PATH, 'vendor-logo.png'), samplePNG);
  fs.writeFileSync(path.join(TEST_IMAGE_PATH, 'vendor-profile.png'), samplePNG);
  fs.writeFileSync(path.join(TEST_IMAGE_PATH, 'product1.png'), samplePNG);
  fs.writeFileSync(path.join(TEST_IMAGE_PATH, 'product2.png'), samplePNG);
  
  log('✓ Test images created', 'green');
}

// Clean up test images
function cleanupTestImages() {
  if (fs.existsSync(TEST_IMAGE_PATH)) {
    fs.rmSync(TEST_IMAGE_PATH, { recursive: true, force: true });
    log('✓ Test images cleaned up', 'green');
  }
}

// Authentication helpers
let adminToken = null;
let vendorToken = null;
let testVendorId = null;
let testProductId = null;

async function loginAsAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@dentalkit.com',
      password: 'admin123!'
    });
    adminToken = response.data.token;
    log('✓ Admin login successful', 'green');
    return true;
  } catch (error) {
    log('✗ Admin login failed: ' + error.message, 'red');
    return false;
  }
}

async function createAndLoginVendor() {
  try {
    // Create vendor user first
    const vendorData = {
      firstName: 'Test',
      lastName: 'Vendor',
      email: 'testvendor@example.com',
      password: 'password123',
      role: 'vendor',
      company: 'Test Vendor Company'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/admin/users`, vendorData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    log('✓ Test vendor user created', 'green');
    
    // Login as vendor
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: vendorData.email,
      password: vendorData.password
    });
    
    vendorToken = loginResponse.data.token;
    log('✓ Vendor login successful', 'green');
    return true;
  } catch (error) {
    log('✗ Vendor creation/login failed: ' + error.message, 'red');
    return false;
  }
}

// Test functions
async function testVendorLogoUpload() {
  try {
    log('\n--- Testing Vendor Logo Upload (Admin) ---', 'blue');
    
    const formData = new FormData();
    formData.append('name', 'Test Vendor with Logo');
    formData.append('email', 'logovendor@example.com');
    formData.append('description', 'A vendor with a logo');
    formData.append('image', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'vendor-logo.png')));
    
    const response = await axios.post(`${BASE_URL}/api/vendors`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    testVendorId = response.data.id;
    
    if (response.data.logo && response.data.logo.url) {
      log('✓ Vendor logo upload successful', 'green');
      log(`  Logo URL: ${response.data.logo.url}`, 'yellow');
      return true;
    } else {
      log('✗ Vendor logo not found in response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Vendor logo upload failed: ' + error.message, 'red');
    return false;
  }
}

async function testVendorProfileUpdate() {
  try {
    log('\n--- Testing Vendor Profile Update ---', 'blue');
    
    const formData = new FormData();
    formData.append('company', 'Updated Vendor Company');
    formData.append('image', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'vendor-profile.png')));
    
    const response = await axios.put(`${BASE_URL}/api/vendors/me/profile`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${vendorToken}`
      }
    });
    
    if (response.data.user && response.data.user.profileImage) {
      log('✓ Vendor profile image update successful', 'green');
      log(`  Profile Image URL: ${response.data.user.profileImage.url}`, 'yellow');
      return true;
    } else {
      log('✗ Vendor profile image not found in response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Vendor profile update failed: ' + error.message, 'red');
    return false;
  }
}

async function testVendorProductUpload() {
  try {
    log('\n--- Testing Vendor Product Upload ---', 'blue');
    
    // First get categories for the product
    const categoriesResponse = await axios.get(`${BASE_URL}/api/products/categories`);
    const categoryId = categoriesResponse.data.categories[0]?.id;
    
    if (!categoryId) {
      log('✗ No categories found for product creation', 'red');
      return false;
    }
    
    const formData = new FormData();
    formData.append('name', 'Test Product with Images');
    formData.append('description', 'A test product with multiple images');
    formData.append('price', '199.99');
    formData.append('categoryId', categoryId);
    formData.append('stock', '50');
    formData.append('images', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'product1.png')));
    formData.append('images', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'product2.png')));
    
    const response = await axios.post(`${BASE_URL}/api/vendors/me/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${vendorToken}`
      }
    });
    
    testProductId = response.data.product.id;
    
    if (response.data.product.images && response.data.product.images.length > 0) {
      log('✓ Vendor product upload successful', 'green');
      log(`  Product Images: ${response.data.product.images.length} uploaded`, 'yellow');
      response.data.product.images.forEach((img, idx) => {
        log(`    Image ${idx + 1}: ${img.url}`, 'yellow');
      });
      return true;
    } else {
      log('✗ Product images not found in response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Vendor product upload failed: ' + error.message, 'red');
    return false;
  }
}

async function testAdminProductUpload() {
  try {
    log('\n--- Testing Admin Product Upload ---', 'blue');
    
    // Get categories and vendors for the product
    const categoriesResponse = await axios.get(`${BASE_URL}/api/products/categories`);
    const categoryId = categoriesResponse.data.categories[0]?.id;
    
    const vendorsResponse = await axios.get(`${BASE_URL}/api/vendors`);
    const vendorId = vendorsResponse.data.vendors[0]?.id;
    
    if (!categoryId || !vendorId) {
      log('✗ Missing category or vendor for product creation', 'red');
      return false;
    }
    
    const formData = new FormData();
    formData.append('name', 'Admin Test Product');
    formData.append('description', 'A test product created by admin with images');
    formData.append('price', '299.99');
    formData.append('categoryId', categoryId);
    formData.append('vendorId', vendorId);
    formData.append('stock', '100');
    formData.append('images', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'product1.png')));
    formData.append('images', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'product2.png')));
    
    const response = await axios.post(`${BASE_URL}/api/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.data.product.images && response.data.product.images.length > 0) {
      log('✓ Admin product upload successful', 'green');
      log(`  Product Images: ${response.data.product.images.length} uploaded`, 'yellow');
      return true;
    } else {
      log('✗ Admin product images not found in response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Admin product upload failed: ' + error.message, 'red');
    return false;
  }
}

async function testProductImageUpdate() {
  try {
    log('\n--- Testing Product Image Update ---', 'blue');
    
    const formData = new FormData();
    formData.append('name', 'Updated Test Product');
    formData.append('images', fs.createReadStream(path.join(TEST_IMAGE_PATH, 'product1.png')));
    
    const response = await axios.put(`${BASE_URL}/api/vendors/me/products/${testProductId}`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${vendorToken}`
      }
    });
    
    if (response.data.product.images && response.data.product.images.length > 0) {
      log('✓ Product image update successful', 'green');
      log(`  Updated Images: ${response.data.product.images.length}`, 'yellow');
      return true;
    } else {
      log('✗ Product image update failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Product image update failed: ' + error.message, 'red');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Upload Functionality Tests', 'blue');
  log('=====================================\n', 'blue');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Setup
  createTestImages();
  
  // Authentication
  if (!(await loginAsAdmin())) return;
  if (!(await createAndLoginVendor())) return;
  
  // Run tests
  const tests = [
    testVendorLogoUpload,
    testVendorProfileUpdate,
    testVendorProductUpload,
    testAdminProductUpload,
    testProductImageUpdate
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Cleanup
  cleanupTestImages();
  
  // Summary
  log('\n=====================================', 'blue');
  log('📊 Test Results Summary', 'blue');
  log('=====================================', 'blue');
  log(`Total Tests: ${results.total}`, 'yellow');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Upload functionality is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the error messages above.', 'red');
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  cleanupTestImages();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'red');
  cleanupTestImages();
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`Test runner error: ${error.message}`, 'red');
    cleanupTestImages();
    process.exit(1);
  });
}

module.exports = {
  runTests,
  createTestImages,
  cleanupTestImages
};
