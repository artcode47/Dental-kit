#!/usr/bin/env node

/**
 * Comprehensive Database Seeding Script
 * 
 * This script seeds the new Firebase database with:
 * 1. Categories from reseed-categories.js
 * 2. Products from the 3 JSON files
 * 3. Admin user with provided credentials
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin with new credentials
const { db, auth } = require('../config/firebase');

// Categories data from reseed-categories.js
const categoriesToSeed = [
  { 
    id: 'dental-anatomy', 
    name: 'Dental anatomy', 
    nameAr: 'تشريح الأسنان',
    description: 'Anatomy-related study and reference materials', 
    icon: 'academic-cap', 
    isActive: true, 
    slug: 'dental-anatomy',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'operative', 
    name: 'Operative', 
    nameAr: 'الجراحة الترميمية',
    description: 'Restorative and operative dentistry supplies', 
    icon: 'wrench', 
    isActive: true, 
    slug: 'operative',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'fixed-crown', 
    name: 'Fixed (crown)', 
    nameAr: 'التركيبات الثابتة',
    description: 'Fixed prosthodontics including crowns and bridges', 
    icon: 'shield-check', 
    isActive: true, 
    slug: 'fixed-crown',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'removable-prothesis', 
    name: 'Removable (prothesis)', 
    nameAr: 'التركيبات المتحركة',
    description: 'Removable prosthesis materials and accessories', 
    icon: 'puzzle-piece', 
    isActive: true, 
    slug: 'removable-prothesis',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'endo', 
    name: 'Endo', 
    nameAr: 'علاج الجذور',
    description: 'Endodontic instruments and materials', 
    icon: 'beaker', 
    isActive: true, 
    slug: 'endo',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'surgery', 
    name: 'Surgery', 
    nameAr: 'الجراحة',
    description: 'Surgical devices and consumables', 
    icon: 'scissors', 
    isActive: true, 
    slug: 'surgery',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'pedo', 
    name: 'Pedo', 
    nameAr: 'طب أسنان الأطفال',
    description: 'Pediatric dentistry supplies', 
    icon: 'face-smile', 
    isActive: true, 
    slug: 'pedo',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'ortho', 
    name: 'Ortho', 
    nameAr: 'تقويم الأسنان',
    description: 'Orthodontic appliances and materials', 
    icon: 'sparkles', 
    isActive: true, 
    slug: 'ortho',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'perio', 
    name: 'Perio', 
    nameAr: 'طب اللثة',
    description: 'Periodontics instruments and consumables', 
    icon: 'leaf', 
    isActive: true, 
    slug: 'perio',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'devices', 
    name: 'Devices', 
    nameAr: 'الأجهزة',
    description: 'Dental devices and equipment', 
    icon: 'cpu-chip', 
    isActive: true, 
    slug: 'devices',
    createdAt: new Date(), 
    updatedAt: new Date() 
  },
  { 
    id: 'instruments', 
    name: 'Instruments', 
    nameAr: 'الأدوات',
    description: 'General dental instruments', 
    icon: 'tool', 
    isActive: true, 
    slug: 'instruments',
    createdAt: new Date(), 
    updatedAt: new Date() 
  }
];

// Admin user credentials
const adminUser = {
  email: 'admin@dentalkit.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  isVerified: true
};

// Function to clear all existing data
async function clearAllData() {
  try {
    console.log('🗑️  Clearing existing data...\n');
    
    // Clear categories
    const categoriesSnapshot = await db.collection('categories').get();
    if (!categoriesSnapshot.empty) {
      const batch = db.batch();
      categoriesSnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${categoriesSnapshot.size} categories`);
    }
    
    // Clear products
    const productsSnapshot = await db.collection('products').get();
    if (!productsSnapshot.empty) {
      const batch = db.batch();
      productsSnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${productsSnapshot.size} products`);
    }
    
    // Clear users
    const usersSnapshot = await db.collection('users').get();
    if (!usersSnapshot.empty) {
      const batch = db.batch();
      usersSnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${usersSnapshot.size} users`);
    }
    
    console.log('✅ All existing data cleared\n');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

// Function to seed categories
async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...\n');
    
    for (const categoryData of categoriesToSeed) {
      await db.collection('categories').doc(categoryData.id).set(categoryData);
      console.log(`✅ Created category: ${categoryData.name} (${categoryData.id})`);
    }
    
    console.log(`\n✅ Successfully seeded ${categoriesToSeed.length} categories\n`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

// Function to load and process product data from JSON files
async function loadProductData() {
  try {
    console.log('📦 Loading product data from JSON files...\n');
    
    const jsonFiles = [
      'schema_22_Kandil.json',
      'schema_61_Denta_Carts.json', 
      'schema_9_Misr_Sinai_For_Supplies.json'
    ];
    
    let allProducts = [];
    
    for (const fileName of jsonFiles) {
      const filePath = path.join(__dirname, '..', '..', fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`📄 Reading ${fileName}...`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const products = JSON.parse(fileContent);
        
        // Process products to fix category and vendor IDs
        const processedProducts = products.map(product => ({
          ...product,
          id: product.sku || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          categoryId: 'operative', // Default category, can be updated later
          vendorId: getVendorIdFromFileName(fileName),
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          currency: 'EGP'
        }));
        
        allProducts.push(...processedProducts);
        console.log(`✅ Loaded ${processedProducts.length} products from ${fileName}`);
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

// Helper function to get vendor ID from filename
function getVendorIdFromFileName(fileName) {
  if (fileName.includes('Kandil')) return 'kandil';
  if (fileName.includes('Denta_Carts')) return 'denta-carts';
  if (fileName.includes('Misr_Sinai')) return 'misr-sinai';
  return 'unknown';
}

// Function to seed products in batches
async function seedProducts(products) {
  try {
    console.log('🌱 Seeding products...\n');
    
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

// Function to create admin user
async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...\n');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    
    // Create user data
    const userData = {
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      isActive: adminUser.isActive,
      isVerified: adminUser.isVerified,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null
    };
    
    // Create user document
    const userRef = db.collection('users').doc();
    await userRef.set(userData);
    
    console.log(`✅ Created admin user: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   User ID: ${userRef.id}\n`);
    
    return userRef.id;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Function to verify seeded data
async function verifySeededData() {
  try {
    console.log('🔍 Verifying seeded data...\n');
    
    // Check categories
    const categoriesSnapshot = await db.collection('categories').get();
    console.log(`📊 Categories: ${categoriesSnapshot.size} (expected: ${categoriesToSeed.length})`);
    
    // Check products
    const productsSnapshot = await db.collection('products').get();
    console.log(`📊 Products: ${productsSnapshot.size}`);
    
    // Check users
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Users: ${usersSnapshot.size} (expected: 1)`);
    
    // Check admin user
    const adminUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'admin');
    console.log(`📊 Admin users: ${adminUsers.length} (expected: 1)`);
    
    if (adminUsers.length > 0) {
      const adminData = adminUsers[0].data();
      console.log(`   Admin email: ${adminData.email}`);
      console.log(`   Admin role: ${adminData.role}`);
      console.log(`   Admin active: ${adminData.isActive}`);
    }
    
    console.log('\n✅ Data verification completed!\n');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting comprehensive database seeding...\n');
    console.log('📋 This will seed:');
    console.log('   • Categories (11 categories)');
    console.log('   • Products (from 3 JSON files)');
    console.log('   • Admin user (admin@dentalkit.com)\n');
    
    // Step 1: Clear existing data
    await clearAllData();
    
    // Step 2: Seed categories
    await seedCategories();
    
    // Step 3: Load and seed products
    const products = await loadProductData();
    await seedProducts(products);
    
    // Step 4: Create admin user
    await createAdminUser();
    
    // Step 5: Verify seeded data
    await verifySeededData();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Categories seeded');
    console.log('   ✅ Products seeded');
    console.log('   ✅ Admin user created');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Email: admin@dentalkit.com');
    console.log('   Password: Admin123!');
    console.log('\n🚀 You can now start your application!');
    
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
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
  clearAllData, 
  seedCategories, 
  loadProductData, 
  seedProducts, 
  createAdminUser, 
  verifySeededData 
};

