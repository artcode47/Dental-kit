#!/usr/bin/env node

const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing API pagination...\n');
    
    // Test first page
    const response1 = await axios.get('http://localhost:8080/api/admin/products?page=1&limit=100');
    console.log('Page 1:');
    console.log(`  Products: ${response1.data.products?.length || 0}`);
    console.log(`  Total: ${response1.data.total}`);
    console.log(`  Total Pages: ${response1.data.totalPages}`);
    console.log(`  Has Next Page: ${response1.data.hasNextPage}`);
    console.log(`  Current Page: ${response1.data.currentPage}`);
    
    // Test second page
    const response2 = await axios.get('http://localhost:8080/api/admin/products?page=2&limit=100');
    console.log('\nPage 2:');
    console.log(`  Products: ${response2.data.products?.length || 0}`);
    console.log(`  Total: ${response2.data.total}`);
    console.log(`  Total Pages: ${response2.data.totalPages}`);
    console.log(`  Has Next Page: ${response2.data.hasNextPage}`);
    console.log(`  Current Page: ${response2.data.currentPage}`);
    
    // Test third page
    const response3 = await axios.get('http://localhost:8080/api/admin/products?page=3&limit=100');
    console.log('\nPage 3:');
    console.log(`  Products: ${response3.data.products?.length || 0}`);
    console.log(`  Total: ${response3.data.total}`);
    console.log(`  Total Pages: ${response3.data.totalPages}`);
    console.log(`  Has Next Page: ${response3.data.hasNextPage}`);
    console.log(`  Current Page: ${response3.data.currentPage}`);
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    process.exit(0);
  }
}

testAPI();

