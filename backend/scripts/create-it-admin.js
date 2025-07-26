const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createITAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dental-website';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if IT admin already exists
    const existingAdmin = await User.findOne({ role: 'it_admin' });
    if (existingAdmin) {
      console.log('ℹ️  IT Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Verified: ${existingAdmin.isVerified}`);
      return;
    }

    // Create IT admin user
    const hashedPassword = await bcrypt.hash('ITAdmin123!', 12);
    
    const itAdmin = new User({
      email: 'itadmin@dentalstore.com',
      password: hashedPassword,
      firstName: 'IT',
      lastName: 'Administrator',
      role: 'it_admin',
      isVerified: true,
      consentGiven: true,
      consentTimestamp: new Date(),
      emailPreferences: {
        marketing: false,
        security: true,
        updates: true
      }
    });

    await itAdmin.save();

    console.log('🎉 IT Admin created successfully!');
    console.log('📧 Email: itadmin@dentalstore.com');
    console.log('🔑 Password: ITAdmin123!');
    console.log('👤 Role: it_admin');
    console.log('✅ Verified: true');
    console.log('');
    console.log('🔗 Access IT Dashboard:');
    console.log('   http://localhost:5000/it-dashboard');
    console.log('');
    console.log('🔐 API Login:');
    console.log('   POST /api/it-auth/login');
    console.log('   Body: { "email": "itadmin@dentalstore.com", "password": "ITAdmin123!" }');

  } catch (error) {
    console.error('❌ Error creating IT admin:', error.message);
    console.error('💡 Make sure MongoDB is running and environment variables are set');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createITAdmin(); 