const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'dental-kit-41955'
  });
}

const db = admin.firestore();

// Proper categories with slugs
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

// Function to clear all existing categories
async function clearCategories() {
  try {
    console.log('🗑️  Clearing existing categories...\n');
    
    const categoriesSnapshot = await db.collection('categories').get();
    
    if (categoriesSnapshot.empty) {
      console.log('ℹ️  No categories found to clear.');
      return;
    }
    
    console.log(`📊 Found ${categoriesSnapshot.size} categories to delete:`);
    
    // Delete categories in batches
    const batch = db.batch();
    let deleteCount = 0;
    
    categoriesSnapshot.forEach(doc => {
      console.log(`   🗑️  Deleting: ${doc.data().name} (ID: ${doc.id})`);
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    await batch.commit();
    console.log(`\n✅ Successfully deleted ${deleteCount} categories.`);
    
  } catch (error) {
    console.error('❌ Error clearing categories:', error);
    throw error;
  }
}

// Function to seed categories with proper slugs
async function seedCategories() {
  try {
    console.log('\n🌱 Seeding categories with proper slugs...\n');
    
    for (const categoryData of categoriesToSeed) {
      try {
        // Create category document with specific ID
        await db.collection('categories').doc(categoryData.id).set(categoryData);
        console.log(`✅ Created category: ${categoryData.name} (ID: ${categoryData.id}, Slug: ${categoryData.slug})`);
        
      } catch (error) {
        console.error(`❌ Error creating category ${categoryData.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Categories seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

// Function to verify categories
async function verifyCategories() {
  try {
    console.log('\n🔍 Verifying categories...\n');
    
    const categoriesSnapshot = await db.collection('categories').get();
    
    if (categoriesSnapshot.empty) {
      console.log('❌ No categories found!');
      return false;
    }
    
    console.log('📋 Current categories:');
    categoriesSnapshot.forEach(doc => {
      const category = doc.data();
      console.log(`   ✅ ${category.name} (ID: ${doc.id}, Slug: ${category.slug})`);
    });
    
    // Check if all required categories exist
    const existingSlugs = categoriesSnapshot.docs.map(doc => doc.data().slug);
    const requiredSlugs = categoriesToSeed.map(cat => cat.slug);
    
    console.log('\n🔍 Checking for required categories:');
    let allCategoriesExist = true;
    
    requiredSlugs.forEach(slug => {
      if (existingSlugs.includes(slug)) {
        console.log(`   ✅ ${slug} - Found`);
      } else {
        console.log(`   ❌ ${slug} - Missing`);
        allCategoriesExist = false;
      }
    });
    
    if (allCategoriesExist) {
      console.log('\n✅ All required categories are present with proper slugs!');
      return true;
    } else {
      console.log('\n⚠️  Some categories are missing or have incorrect slugs.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verifying categories:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting category cleanup and reseeding...\n');
    
    // Step 1: Clear existing categories
    await clearCategories();
    
    // Step 2: Seed new categories
    await seedCategories();
    
    // Step 3: Verify categories
    const success = await verifyCategories();
    
    if (success) {
      console.log('\n🎉 Category reseeding completed successfully!');
      console.log('✅ You can now run: node scripts/seed-products-from-vendors.js');
    } else {
      console.log('\n⚠️  Category reseeding completed with issues. Please check the output above.');
    }
    
  } catch (error) {
    console.error('💥 Category reseeding failed:', error);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { clearCategories, seedCategories, verifyCategories };







