#!/usr/bin/env node

/**
 * Vendor Analysis Script
 * 
 * This script analyzes the JSON files to extract vendor information
 */

const fs = require('fs');
const path = require('path');

// Read and analyze JSON files to extract vendor information
const files = ['schema_22_Kandil.json', 'schema_61_Denta_Carts.json', 'schema_9_Misr_Sinai_For_Supplies.json'];
const vendors = new Map();

files.forEach(fileName => {
  const filePath = path.join(__dirname, '..', fileName);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\n📄 Analyzing ${fileName}...`);
    
    data.forEach(product => {
      const vendorId = product.vendorId || 'unknown';
      const brand = product.brand || 'Unknown Brand';
      
      if (!vendors.has(vendorId)) {
        vendors.set(vendorId, {
          id: vendorId,
          name: getVendorNameFromId(vendorId),
          nameAr: getVendorNameArFromId(vendorId),
          email: `${vendorId.replace('vendors/', '')}@dentalkit.com`,
          phone: '+20 123 456 7890',
          address: 'Cairo, Egypt',
          description: `Professional dental supplies from ${brand}`,
          logo: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
    console.log(`   Found ${data.length} products`);
  }
});

function getVendorNameFromId(vendorId) {
  if (vendorId.includes('Kandil')) return 'Kandil Medical';
  if (vendorId.includes('Denta-Carts')) return 'Denta Carts';
  if (vendorId.includes('Misr-Sinai')) return 'Misr Sinai For Supplies';
  return 'Unknown Vendor';
}

function getVendorNameArFromId(vendorId) {
  if (vendorId.includes('Kandil')) return 'كنديل ميديكال';
  if (vendorId.includes('Denta-Carts')) return 'دنتا كارتس';
  if (vendorId.includes('Misr-Sinai')) return 'مصر سيناء للمستلزمات';
  return 'مورد غير معروف';
}

console.log('\n🏢 Extracted Vendors:');
console.log('====================');
vendors.forEach((vendor, id) => {
  console.log(`ID: ${id}`);
  console.log(`Name: ${vendor.name}`);
  console.log(`NameAr: ${vendor.nameAr}`);
  console.log(`Email: ${vendor.email}`);
  console.log('---');
});

// Export vendors for use in seeding script
module.exports = Array.from(vendors.values());

