const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'dental-kit-41955'
  });
}

const db = admin.firestore();

// Category mapping configuration
const CATEGORY_MAPPING = {
  // Endodontic keywords
  'endo': ['apex', 'locator', 'endodontic', 'root canal', 'file', 'reamer', 'gutta', 'percha', 'sealer', 'obturation', 'pulp', 'vitality'],
  
  // Surgical keywords
  'surgery': ['surgical', 'scalpel', 'blade', 'suture', 'implant', 'bone', 'graft', 'extraction', 'forceps', 'elevator', 'periotome', 'surgical kit'],
  
  // Operative keywords
  'operative': ['cavity', 'filling', 'composite', 'amalgam', 'restoration', 'bonding', 'etching', 'adhesive', 'cement', 'liner', 'base', 'excavator'],
  
  // Fixed prosthodontics keywords
  'fixed-crown': ['crown', 'bridge', 'prosthesis', 'porcelain', 'ceramic', 'zirconia', 'pfm', 'alloy', 'casting', 'impression', 'die', 'wax'],
  
  // Removable prosthodontics keywords
  'removable-prothesis': ['denture', 'partial', 'acrylic', 'resin', 'clasp', 'framework', 'try-in', 'processing', 'relining'],
  
  // Orthodontic keywords
  'ortho': ['orthodontic', 'bracket', 'wire', 'arch', 'band', 'ligature', 'elastic', 'retainer', 'appliance', 'braces', 'aligner'],
  
  // Periodontic keywords
  'perio': ['periodontal', 'scaling', 'curette', 'scaler', 'probe', 'gingival', 'periodontics', 'hygiene', 'cleaning'],
  
  // Pediatric keywords
  'pedo': ['pediatric', 'child', 'kids', 'baby', 'primary', 'deciduous', 'space maintainer', 'pedo'],
  
  // Instruments keywords
  'instruments': ['instrument', 'handpiece', 'burs', 'drill', 'probe', 'mirror', 'explorer', 'tweezers', 'scissors', 'pliers'],
  
  // Devices keywords
  'devices': ['device', 'equipment', 'machine', 'unit', 'system', 'autoclave', 'sterilizer', 'x-ray', 'camera', 'scanner', 'laser'],
  
  // Dental anatomy keywords
  'dental-anatomy': ['anatomy', 'model', 'skull', 'jaw', 'tooth', 'teeth', 'dental chart', 'poster', 'educational']
};

// Vendor mapping
const VENDOR_MAPPING = {
  'vendors/Kandil': 'Kandil',
  'vendors/Denta-Carts': 'Denta Carts', 
  'vendors/Mist-Sinai': 'Misr Sinai For Supplies'
};

// Function to detect category based on product name and description
function detectCategory(product) {
  const text = `${product.name} ${product.description}`.toLowerCase();
  
  // Score each category based on keyword matches
  const categoryScores = {};
  
  Object.keys(CATEGORY_MAPPING).forEach(categoryId => {
    const keywords = CATEGORY_MAPPING[categoryId];
    let score = 0;
    
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    if (score > 0) {
      categoryScores[categoryId] = score;
    }
  });
  
  // Return the category with the highest score
  if (Object.keys(categoryScores).length > 0) {
    const bestCategory = Object.keys(categoryScores).reduce((a, b) => 
      categoryScores[a] > categoryScores[b] ? a : b
    );
    return bestCategory;
  }
  
  // Default fallback
  return 'devices';
}

// Function to get category document ID from category name
async function getCategoryId(categoryName) {
  try {
    const categoriesSnapshot = await db.collection('categories')
      .where('slug', '==', categoryName)
      .limit(1)
      .get();
    
    if (!categoriesSnapshot.empty) {
      return categoriesSnapshot.docs[0].id;
    }
    
    // If not found, try to find by name
    const categoriesByNameSnapshot = await db.collection('categories')
      .where('name', '==', categoryName)
      .limit(1)
      .get();
    
    if (!categoriesByNameSnapshot.empty) {
      return categoriesByNameSnapshot.docs[0].id;
    }
    
    console.warn(`Category not found: ${categoryName}, using devices as fallback`);
    return 'devices'; // Fallback category ID
  } catch (error) {
    console.error(`Error finding category ${categoryName}:`, error);
    return 'devices';
  }
}

// Function to get vendor document ID from vendor name
async function getVendorId(vendorName) {
  try {
    const vendorsSnapshot = await db.collection('vendors')
      .where('name', '==', vendorName)
      .limit(1)
      .get();
    
    if (!vendorsSnapshot.empty) {
      return vendorsSnapshot.docs[0].id;
    }
    
    console.warn(`Vendor not found: ${vendorName}`);
    return null;
  } catch (error) {
    console.error(`Error finding vendor ${vendorName}:`, error);
    return null;
  }
}

// Function to process and clean product data
function processProductData(product, categoryId, vendorId) {
  const now = new Date();
  
  return {
    // Basic Information
    name: product.name || 'Unnamed Product',
    nameAr: product.nameAr || '',
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    
    // Pricing
    price: parseFloat(product.price) || 0,
    originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
    currency: product.currency || 'EGP',
    
    // Product Identification
    sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    vendorSku: product.vendorSku || product.sku || '',
    brand: product.brand || '',
    model: product.model || '',
    
    // Relationships
    categoryId: categoryId,
    vendorId: vendorId,
    
    // Inventory
    stock: parseInt(product.stock) || 0,
    minStockLevel: parseInt(product.minStockLevel) || 5,
    maxStockLevel: parseInt(product.maxStockLevel) || 1000,
    
    // Media
    images: product.images || [],
    
    // Product Details
    specifications: product.specifications || {},
    features: product.features || [],
    tags: product.tags || [],
    
    // Physical Properties
    weight: product.weight || { value: null, unit: 'g' },
    dimensions: product.dimensions || { length: null, width: null, height: null, unit: 'cm' },
    
    // Product Status
    isActive: product.isActive !== undefined ? product.isActive : true,
    isFeatured: product.isFeatured || false,
    isOnSale: product.isOnSale || false,
    salePercentage: product.salePercentage || null,
    
    // SEO & Marketing
    slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    metaTitle: product.metaTitle || product.name,
    metaDescription: product.metaDescription || product.description,
    
    // Analytics & Performance
    averageRating: product.averageRating || 0,
    totalReviews: product.totalReviews || 0,
    totalSold: product.totalSold || 0,
    views: product.views || 0,
    
    // Search & Discovery
    searchKeywords: product.searchKeywords || [],
    
    // Vendor-Specific Data
    vendorData: {
      sourceUrl: product.vendorData?.sourceUrl || '',
      lastScraped: now,
      scrapedData: product.vendorData?.scrapedData || {}
    },
    
    // Product Variants
    variants: product.variants || [],
    
    // Bundle Products
    isBundle: product.isBundle || false,
    bundleItems: product.bundleItems || [],
    
    // Timestamps
    createdAt: now,
    updatedAt: now,
    lastScrapedAt: now
  };
}

// Function to seed products from a single JSON file
async function seedProductsFromFile(filePath, vendorName) {
  try {
    console.log(`\n📁 Processing file: ${filePath}`);
    
    // Read and parse JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileContent);
    
    console.log(`📊 Found ${products.length} products in ${vendorName}`);
    
    // Get vendor ID
    const vendorId = await getVendorId(vendorName);
    if (!vendorId) {
      console.error(`❌ Vendor not found: ${vendorName}. Skipping this file.`);
      return { processed: 0, errors: products.length };
    }
    
    console.log(`✅ Vendor ID found: ${vendorId}`);
    
    let processed = 0;
    let errors = 0;
    let categoryStats = {};
    
    // Process products in batches
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchPromises = batch.map(async (product) => {
        try {
          // Detect category
          const detectedCategory = detectCategory(product);
          const categoryId = await getCategoryId(detectedCategory);
          
          // Track category statistics
          categoryStats[detectedCategory] = (categoryStats[detectedCategory] || 0) + 1;
          
          // Process product data
          const processedProduct = processProductData(product, categoryId, vendorId);
          
          // Add to Firestore
          await db.collection('products').add(processedProduct);
          
          processed++;
          
          if (processed % 50 === 0) {
            console.log(`✅ Processed ${processed}/${products.length} products from ${vendorName}`);
          }
          
        } catch (error) {
          console.error(`❌ Error processing product ${product.name}:`, error.message);
          errors++;
        }
      });
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📈 ${vendorName} Statistics:`);
    console.log(`✅ Successfully processed: ${processed}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Category distribution:`);
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    return { processed, errors, categoryStats };
    
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
    return { processed: 0, errors: 1 };
  }
}

// Main seeding function
async function seedAllProducts() {
  try {
    console.log('🚀 Starting product seeding process...\n');
    
    const startTime = Date.now();
    
    // Define the files and their corresponding vendors
    const filesToProcess = [
      {
        path: path.join(__dirname, '../../schema_22_Kandil.json'),
        vendor: 'Kandil'
      },
      {
        path: path.join(__dirname, '../../schema_61_Denta_Carts.json'),
        vendor: 'Denta Carts'
      },
      {
        path: path.join(__dirname, '../../schema_9_Misr_Sinai_For_Supplies.json'),
        vendor: 'Misr Sinai For Supplies'
      }
    ];
    
    let totalProcessed = 0;
    let totalErrors = 0;
    let overallCategoryStats = {};
    
    // Process each file
    for (const fileInfo of filesToProcess) {
      const result = await seedProductsFromFile(fileInfo.path, fileInfo.vendor);
      
      totalProcessed += result.processed;
      totalErrors += result.errors;
      
      // Merge category statistics
      Object.entries(result.categoryStats || {}).forEach(([category, count]) => {
        overallCategoryStats[category] = (overallCategoryStats[category] || 0) + count;
      });
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log(`✅ Total products processed: ${totalProcessed}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    console.log(`📊 Overall category distribution:`);
    
    Object.entries(overallCategoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });
    
    console.log('\n✨ Products have been successfully seeded to Firebase!');
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
  }
}

// Run the seeding process
if (require.main === module) {
  seedAllProducts()
    .then(() => {
      console.log('\n🏁 Seeding process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAllProducts, detectCategory, processProductData };


