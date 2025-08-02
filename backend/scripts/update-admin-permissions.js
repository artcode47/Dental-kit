const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateAdminPermissions() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dental-website';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('📧 Found admin user:', adminUser.email);
    console.log('👤 Current role:', adminUser.role);
    console.log('🔑 Current permissions:', adminUser.permissions || []);

    // Update permissions
    const updatedPermissions = [
      'admin_access',
      'manage_users', 
      'manage_products',
      'view_analytics',
      'manage_orders',
      'manage_categories',
      'manage_vendors',
      'manage_reviews',
      'manage_coupons',
      'manage_gift_cards',
      'view_reports',
      'manage_settings'
    ];

    adminUser.permissions = updatedPermissions;
    await adminUser.save();

    console.log('✅ Admin permissions updated successfully!');
    console.log('🔑 New permissions:', adminUser.permissions);

  } catch (error) {
    console.error('❌ Error updating admin permissions:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
updateAdminPermissions(); 