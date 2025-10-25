#!/usr/bin/env node

const { db } = require('../config/firebase');

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...\n');
    
    const snapshot = await db.collection('products').get();
    console.log(`Total products in database: ${snapshot.size}`);
    
    // Check vendor distribution
    const vendorCounts = {};
    snapshot.forEach(doc => {
      const product = doc.data();
      const vendorId = product.vendorId;
      vendorCounts[vendorId] = (vendorCounts[vendorId] || 0) + 1;
    });
    
    console.log('\nProducts by vendor:');
    Object.entries(vendorCounts).forEach(([vendorId, count]) => {
      console.log(`  ${vendorId}: ${count} products`);
    });
    
    // Check if products are active
    let activeCount = 0;
    let inactiveCount = 0;
    snapshot.forEach(doc => {
      const product = doc.data();
      if (product.isActive) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });
    
    console.log(`\nActive products: ${activeCount}`);
    console.log(`Inactive products: ${inactiveCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkProducts();

