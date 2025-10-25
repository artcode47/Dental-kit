#!/usr/bin/env node

/**
 * Vendor and Product Reseeding Script
 * 
 * This script:
 * 1. Seeds vendors extracted from JSON files
 * 2. Reseeds products with proper vendor links
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const { db } = require('../config/firebase');

// Vendor data extracted from JSON files
const vendorsToSeed = [
  {
    id: 'kandil',
    name: 'Kandil Medical',
    nameAr: 'كنديل ميديكال',
    email: 'info@kandilmedical.com',
    phone: '+20 2 1234 5678',
    address: 'Cairo, Egypt',
    description: 'Professional dental equipment and supplies from Kandil Medical',
    logo: null,
    isActive: true,
    slug: 'kandil-medical',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'denta-carts',
    name: 'Denta Carts',
    nameAr: 'دنتا كارتس',
    email: 'info@dentacarts.com',
    phone: '+20 2 2345 6789',
    address: 'Alexandria, Egypt',
    description: 'Comprehensive dental supplies and instruments from Denta Carts',
    logo: null,
    isActive: true,
    slug: 'denta-carts',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'misr-sinai',
    name: 'Misr Sinai For Supplies',
    nameAr: 'مصر سيناء للمستلزمات',
    email: 'info@misrsinai.com',
    phone: '+20 2 3456 7890',
    address: 'Sinai, Egypt',
    description: 'High-quality dental supplies and equipment from Misr Sinai',
    logo: null,
    isActive: true,
    slug: 'misr-sinai-supplies',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to clear existing vendors and products
async function clearVendorsAndProducts() {
  try {
    console.log('🗑️  Clearing existing vendors and products...\n');
    
    // Clear vendors
    const vendorsSnapshot = await db.collection('vendors').get();
    if (!vendorsSnapshot.empty) {
      const batch = db.batch();
      vendorsSnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${vendorsSnapshot.size} vendors`);
    }
    
    // Clear products
    const productsSnapshot = await db.collection('products').get();
    if (!productsSnapshot.empty) {
      const batch = db.batch();
      productsSnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${productsSnapshot.size} products`);
    }
    
    console.log('✅ Vendors and products cleared\n');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

// Function to seed vendors
async function seedVendors() {
  try {
    console.log('🏢 Seeding vendors...\n');
    
    for (const vendorData of vendorsToSeed) {
      await db.collection('vendors').doc(vendorData.id).set(vendorData);
      console.log(`✅ Created vendor: ${vendorData.name} (${vendorData.id})`);
    }
    
    console.log(`\n✅ Successfully seeded ${vendorsToSeed.length} vendors\n`);
    
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
    throw error;
  }
}

// Function to load and process product data with proper vendor mapping
async function loadProductDataWithVendors() {
  try {
    console.log('📦 Loading product data with vendor mapping...\n');
    
    const jsonFiles = [
      { file: 'schema_22_Kandil.json', vendorId: 'kandil' },
      { file: 'schema_61_Denta_Carts.json', vendorId: 'denta-carts' },
      { file: 'schema_9_Misr_Sinai_For_Supplies.json', vendorId: 'misr-sinai' }
    ];
    
    let allProducts = [];
    
    for (const { file: fileName, vendorId } of jsonFiles) {
      const filePath = path.join(__dirname, '..', '..', fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`📄 Reading ${fileName}...`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const products = JSON.parse(fileContent);
        
        // Process products with proper vendor mapping
        const processedProducts = products.map(product => ({
          ...product,
          id: product.sku || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          vendorId: vendorId, // Use the mapped vendor ID
          categoryId: 'operative', // Default category, can be updated later
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          currency: 'EGP',
          // Clean up the data
          name: product.name || 'Unnamed Product',
          description: product.description || product.name || 'No description available',
          price: product.price || 0,
          stock: product.stock || 0,
          brand: product.brand || 'Unknown Brand',
          sku: product.sku || product.vendorSku || `SKU_${Date.now()}`,
          images: product.images || [],
          specifications: product.specifications || {},
          features: product.features || [],
          tags: product.tags || [],
          weight: product.weight || { value: null, unit: 'g' },
          dimensions: product.dimensions || { length: null, width: null, height: null, unit: 'cm' },
          isFeatured: product.isFeatured || false,
          isOnSale: product.isOnSale || false,
          salePercentage: product.salePercentage || null,
          slug: product.slug || generateSlug(product.name),
          metaTitle: product.metaTitle || product.name,
          metaDescription: product.metaDescription || product.description,
          averageRating: product.averageRating || 0,
          totalReviews: product.totalReviews || 0,
          totalSold: product.totalSold || 0,
          views: product.views || 0
        }));
        
        allProducts.push(...processedProducts);
        console.log(`✅ Loaded ${processedProducts.length} products from ${fileName} (Vendor: ${vendorId})`);
      } else {
        console.log(`⚠️  File not found: ${fileName}`);
      }
    }
    
    console.log(`\n📊 Total products loaded: ${allProducts.length}\n`);
    return allProducts;
    
  } catch (error) {
    console.error('❌ Error loading product data:', error);
    throw error;
  }
}

// Helper function to generate slug
function generateSlug(name) {
  if (!name) return 'unnamed-product';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Function to seed products in batches
async function seedProducts(products) {
  try {
    console.log('🌱 Seeding products with vendor links...\n');
    
    const batchSize = 100; // Process 100 products at a time
    let processedCount = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = db.batch();
      const batchProducts = products.slice(i, i + batchSize);
      
      batchProducts.forEach(product => {
        const productRef = db.collection('products').doc(product.id);
        batch.set(productRef, product);
      });
      
      await batch.commit();
      processedCount += batchProducts.length;
      
      console.log(`✅ Processed ${processedCount}/${products.length} products (${Math.round(processedCount/products.length*100)}%)`);
    }
    
    console.log(`\n✅ Successfully seeded ${products.length} products\n`);
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Function to verify seeded data
async function verifySeededData() {
  try {
    console.log('🔍 Verifying seeded data...\n');
    
    // Check vendors
    const vendorsSnapshot = await db.collection('vendors').get();
    console.log(`📊 Vendors: ${vendorsSnapshot.size} (expected: ${vendorsToSeed.length})`);
    
    vendorsSnapshot.forEach(doc => {
      const vendor = doc.data();
      console.log(`   ✅ ${vendor.name} (${doc.id})`);
    });
    
    // Check products
    const productsSnapshot = await db.collection('products').get();
    console.log(`\n📊 Products: ${productsSnapshot.size}`);
    
    // Check vendor distribution
    const vendorCounts = {};
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      const vendorId = product.vendorId;
      vendorCounts[vendorId] = (vendorCounts[vendorId] || 0) + 1;
    });
    
    console.log('\n📊 Products by vendor:');
    Object.entries(vendorCounts).forEach(([vendorId, count]) => {
      console.log(`   ${vendorId}: ${count} products`);
    });
    
    console.log('\n✅ Data verification completed!\n');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting vendor and product reseeding...\n');
    console.log('📋 This will:');
    console.log('   • Clear existing vendors and products');
    console.log('   • Seed 3 vendors');
    console.log('   • Reseed products with proper vendor links\n');
    
    // Step 1: Clear existing data
    await clearVendorsAndProducts();
    
    // Step 2: Seed vendors
    await seedVendors();
    
    // Step 3: Load and seed products with vendor links
    const products = await loadProductDataWithVendors();
    await seedProducts(products);
    
    // Step 4: Verify seeded data
    await verifySeededData();
    
    console.log('🎉 Vendor and product reseeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Vendors seeded');
    console.log('   ✅ Products reseeded with vendor links');
    console.log('\n🚀 You can now test the admin panel with proper vendor filtering!');
    
  } catch (error) {
    console.error('💥 Reseeding failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  clearVendorsAndProducts, 
  seedVendors, 
  loadProductDataWithVendors, 
  seedProducts, 
  verifySeededData 
};

