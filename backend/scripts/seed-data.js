const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
require('dotenv').config();

// Sample data for seeding
const adminUsers = [
  {
    email: 'admin@dentalstore.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: ['admin_access', 'manage_users', 'manage_products', 'view_analytics', 'manage_orders', 'manage_vendors']
  },
  {
    email: 'superadmin@dentalstore.com',
    password: 'SuperAdmin123!',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'admin',
    permissions: ['admin_access', 'manage_users', 'manage_products', 'view_analytics', 'manage_orders', 'manage_vendors', 'system_settings']
  }
];

const categories = [
  {
    name: 'Dental Implants',
    description: 'High-quality dental implants for permanent tooth replacement solutions'
  },
  {
    name: 'Orthodontic Supplies',
    description: 'Comprehensive range of orthodontic materials and appliances'
  },
  {
    name: 'Dental Instruments',
    description: 'Professional dental instruments for various procedures'
  },
  {
    name: 'Dental Materials',
    description: 'Restorative and preventive dental materials'
  },
  {
    name: 'Dental Equipment',
    description: 'Advanced dental equipment and machinery'
  },
  {
    name: 'Hygiene Products',
    description: 'Dental hygiene and preventive care products'
  }
];

const vendors = [
  {
    name: 'DentalTech Pro',
    email: 'contact@dentaltechpro.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Dental Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    description: 'Leading manufacturer of dental implants and surgical instruments',
    website: 'https://dentaltechpro.com',
    contactPerson: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah@dentaltechpro.com',
      phone: '+1-555-0124'
    }
  },
  {
    name: 'Ortho Solutions',
    email: 'info@orthosolutions.com',
    phone: '+1-555-0456',
    address: {
      street: '456 Ortho Avenue',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90210'
    },
    description: 'Specialized in orthodontic supplies and materials',
    website: 'https://orthosolutions.com',
    contactPerson: {
      name: 'Dr. Michael Chen',
      email: 'michael@orthosolutions.com',
      phone: '+1-555-0457'
    }
  },
  {
    name: 'Dental Materials Plus',
    email: 'sales@dentalmaterialsplus.com',
    phone: '+1-555-0789',
    address: {
      street: '789 Material Drive',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60601'
    },
    description: 'Premium dental materials and restorative products',
    website: 'https://dentalmaterialsplus.com',
    contactPerson: {
      name: 'Dr. Emily Rodriguez',
      email: 'emily@dentalmaterialsplus.com',
      phone: '+1-555-0790'
    }
  }
];

const products = [
  {
    name: 'Titanium Dental Implant System',
    description: 'Premium titanium dental implant system with excellent osseointegration properties. Features advanced surface treatment for optimal bone integration and long-term stability.',
    shortDescription: 'High-quality titanium dental implants',
    price: 299.99,
    originalPrice: 399.99,
    category: 'Dental Implants',
    vendor: 'DentalTech Pro',
    stock: 50,
    brand: 'DentalTech Pro',
    specifications: {
      'Material': 'Titanium Grade 4',
      'Diameter': '3.75mm, 4.2mm, 5.0mm',
      'Length': '8mm, 10mm, 12mm, 14mm',
      'Surface Treatment': 'Acid-etched and sandblasted',
      'Packaging': 'Sterile, individually packaged'
    },
    features: [
      'Excellent osseointegration',
      'Advanced surface treatment',
      'Multiple size options',
      'Sterile packaging',
      'CE and FDA approved'
    ],
    weight: 0.05,
    dimensions: { length: 12, width: 4.2, height: 4.2 },
    isFeatured: true,
    isOnSale: true,
    salePercentage: 25,
    tags: ['implants', 'titanium', 'surgical', 'premium'],
    averageRating: 4.8,
    totalReviews: 127,
    totalSold: 89
  },
  {
    name: 'Ceramic Brackets Set',
    description: 'Aesthetic ceramic brackets for orthodontic treatment. Made from high-quality ceramic material for superior aesthetics and patient comfort.',
    shortDescription: 'Aesthetic ceramic orthodontic brackets',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Orthodontic Supplies',
    vendor: 'Ortho Solutions',
    stock: 100,
    brand: 'Ortho Solutions',
    specifications: {
      'Material': 'High-strength ceramic',
      'Type': 'Self-ligating',
      'Size': 'Standard',
      'Color': 'Tooth-colored',
      'Packaging': 'Set of 20 brackets'
    },
    features: [
      'Aesthetic appearance',
      'Self-ligating design',
      'Reduced friction',
      'Easy to clean',
      'Comfortable for patients'
    ],
    weight: 0.02,
    dimensions: { length: 3, width: 2, height: 2 },
    isFeatured: false,
    isOnSale: true,
    salePercentage: 25,
    tags: ['orthodontics', 'ceramic', 'brackets', 'aesthetic'],
    averageRating: 4.6,
    totalReviews: 89,
    totalSold: 156
  },
  {
    name: 'Composite Resin Kit',
    description: 'Professional composite resin kit for dental restorations. Includes various shades and curing light for optimal results.',
    shortDescription: 'Complete composite resin restoration kit',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Dental Materials',
    vendor: 'Dental Materials Plus',
    stock: 25,
    brand: 'Dental Materials Plus',
    specifications: {
      'Material': 'Nanohybrid composite',
      'Shades': '16 shades included',
      'Packaging': 'Kit with curing light',
      'Shelf Life': '24 months',
      'Curing Time': '20 seconds'
    },
    features: [
      '16 different shades',
      'Includes curing light',
      'High strength and durability',
      'Excellent polishability',
      'Low shrinkage'
    ],
    weight: 0.5,
    dimensions: { length: 15, width: 10, height: 5 },
    isFeatured: true,
    isOnSale: false,
    salePercentage: 0,
    tags: ['composite', 'restoration', 'resin', 'kit'],
    averageRating: 4.7,
    totalReviews: 203,
    totalSold: 78
  },
  {
    name: 'Dental Handpiece',
    description: 'High-speed dental handpiece with excellent precision and reliability. Features advanced air turbine technology for smooth operation.',
    shortDescription: 'Professional high-speed dental handpiece',
    price: 599.99,
    originalPrice: 699.99,
    category: 'Dental Equipment',
    vendor: 'DentalTech Pro',
    stock: 15,
    brand: 'DentalTech Pro',
    specifications: {
      'Speed': '400,000 RPM',
      'Type': 'High-speed air turbine',
      'Weight': '85g',
      'Autoclavable': 'Yes',
      'Warranty': '2 years'
    },
    features: [
      'High-speed operation',
      'Lightweight design',
      'Autoclavable',
      'Low noise',
      'Excellent precision'
    ],
    weight: 0.085,
    dimensions: { length: 12, width: 2, height: 2 },
    isFeatured: false,
    isOnSale: true,
    salePercentage: 14,
    tags: ['handpiece', 'equipment', 'high-speed', 'professional'],
    averageRating: 4.9,
    totalReviews: 67,
    totalSold: 34
  },
  {
    name: 'Fluoride Varnish',
    description: 'Professional fluoride varnish for caries prevention. Contains 5% sodium fluoride for maximum protection.',
    shortDescription: 'Professional fluoride varnish for caries prevention',
    price: 45.99,
    originalPrice: 55.99,
    category: 'Hygiene Products',
    vendor: 'Dental Materials Plus',
    stock: 200,
    brand: 'Dental Materials Plus',
    specifications: {
      'Active Ingredient': '5% Sodium Fluoride',
      'Volume': '10ml',
      'Application': 'Professional use only',
      'Shelf Life': '36 months',
      'Packaging': 'Individual applicators'
    },
    features: [
      'High fluoride concentration',
      'Easy application',
      'Long-lasting protection',
      'Pleasant taste',
      'Safe for all ages'
    ],
    weight: 0.01,
    dimensions: { length: 8, width: 1, height: 1 },
    isFeatured: false,
    isOnSale: false,
    salePercentage: 0,
    tags: ['fluoride', 'prevention', 'varnish', 'hygiene'],
    averageRating: 4.5,
    totalReviews: 145,
    totalSold: 234
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dental-website';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - uncomment if you want to start fresh)
    // await User.deleteMany({ role: 'admin' });
    // await Category.deleteMany({});
    // await Vendor.deleteMany({});
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create admin users
    console.log('\n👥 Creating admin users...');
    for (const adminData of adminUsers) {
      const existingAdmin = await User.findOne({ email: adminData.email });
      if (existingAdmin) {
        console.log(`ℹ️  Admin ${adminData.email} already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      const admin = new User({
        ...adminData,
        password: hashedPassword,
        isVerified: true,
        consentGiven: true,
        consentTimestamp: new Date(),
        emailPreferences: {
          marketing: false,
          security: true,
          updates: true
        }
      });

      await admin.save();
      console.log(`✅ Created admin: ${adminData.email}`);
    }

    // Create categories
    console.log('\n📂 Creating categories...');
    const categoryMap = new Map();
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (existingCategory) {
        console.log(`ℹ️  Category "${categoryData.name}" already exists`);
        categoryMap.set(categoryData.name, existingCategory._id);
        continue;
      }

      // Generate slug manually to ensure it's set
      const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const category = new Category({
        ...categoryData,
        slug: slug
      });
      
      await category.save();
      categoryMap.set(categoryData.name, category._id);
      console.log(`✅ Created category: ${categoryData.name}`);
    }

    // Create vendors
    console.log('\n🏢 Creating vendors...');
    const vendorMap = new Map();
    for (const vendorData of vendors) {
      const existingVendor = await Vendor.findOne({ email: vendorData.email });
      if (existingVendor) {
        console.log(`ℹ️  Vendor ${vendorData.email} already exists`);
        vendorMap.set(vendorData.name, existingVendor._id);
        continue;
      }

      // Generate slug manually to ensure it's set
      const slug = vendorData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const vendor = new Vendor({
        ...vendorData,
        slug: slug
      });
      
      await vendor.save();
      vendorMap.set(vendorData.name, vendor._id);
      console.log(`✅ Created vendor: ${vendorData.name}`);
    }

    // Create products
    console.log('\n🛍️  Creating products...');
    for (const productData of products) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (existingProduct) {
        console.log(`ℹ️  Product "${productData.name}" already exists`);
        continue;
      }

      // Generate slug and SKU manually to ensure they're set
      const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const sku = `DENTAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const product = new Product({
        ...productData,
        category: categoryMap.get(productData.category),
        vendor: vendorMap.get(productData.vendor),
        slug: slug,
        sku: sku
      });

      await product.save();
      console.log(`✅ Created product: ${productData.name}`);
    }

    console.log('\n🎉 Seed data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Admin users: ${adminUsers.length}`);
    console.log(`   📂 Categories: ${categories.length}`);
    console.log(`   🏢 Vendors: ${vendors.length}`);
    console.log(`   🛍️  Products: ${products.length}`);
    
    console.log('\n🔐 Admin Login Credentials:');
    adminUsers.forEach(admin => {
      console.log(`   📧 ${admin.email} | 🔑 ${admin.password}`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error('💡 Make sure MongoDB is running and environment variables are set');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
seedData(); 