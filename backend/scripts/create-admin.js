const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dental-website';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Verified: ${existingAdmin.isVerified}`);
      return;
    }

    // Create admin user - let the User model handle password hashing
    const admin = new User({
      email: 'admin@dentalstore.com',
      password: 'Admin123!', // Plain password - will be hashed by pre-save middleware
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      consentGiven: true,
      consentTimestamp: new Date(),
      permissions: ['admin_access', 'manage_users', 'manage_products', 'view_analytics'],
      emailPreferences: {
        marketing: false,
        security: true,
        updates: true
      }
    });

    await admin.save();

    console.log('🎉 Admin created successfully!');
    console.log('📧 Email: admin@dentalstore.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: admin');
    console.log('✅ Verified: true');
    console.log('');
    console.log('🔗 Access Admin Dashboard:');
    console.log('   http://localhost:3000/admin/dashboard');
    console.log('');
    console.log('🔐 API Login:');
    console.log('   POST /api/auth/login');
    console.log('   Body: { "email": "admin@dentalstore.com", "password": "Admin123!" }');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error('💡 Make sure MongoDB is running and environment variables are set');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdmin(); 