const { auth, db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@dentalstore.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';

  try {
    console.log('✅ Using Firebase Admin to seed admin user...');

    // Try to get existing auth user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('ℹ️  Auth user already exists. UID:', userRecord.uid);
    } catch (e) {
      console.log('ℹ️  Auth user not found. Creating...');
      userRecord = await auth.createUser({ email, password, displayName: `${firstName} ${lastName}` });
      console.log('✅ Auth user created. UID:', userRecord.uid);
    }

    // Set custom claims for admin access
    const claims = { role: 'admin', admin: true, super_admin: true };
    await auth.setCustomUserClaims(userRecord.uid, claims);
    console.log('✅ Custom claims set for admin access');

    // Ensure Firestore user profile exists/updated
    const usersCol = db.collection('users');

    // Find user doc by email (simple scan to avoid index requirements)
    const snapshot = await usersCol.get();
    let userDocRef = null;
    let userDocData = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === email) {
        userDocRef = usersCol.doc(doc.id);
        userDocData = data;
      }
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const baseData = {
      firebaseUid: userRecord.uid,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      permissions: [
        'admin_access',
        'manage_users',
        'manage_products',
        'manage_orders',
        'manage_categories',
        'manage_coupons',
        'manage_vendors',
        'view_analytics',
        'manage_settings'
      ],
      isActive: true,
      isVerified: true,
      consentGiven: true,
      consentTimestamp: new Date(),
      updatedAt: new Date()
    };

    if (userDocRef) {
      await userDocRef.update(baseData);
      console.log('✅ Updated existing Firestore user document with admin privileges');
    } else {
      const now = new Date();
      await usersCol.add({
        ...baseData,
        createdAt: now
      });
      console.log('✅ Created Firestore user document with admin privileges');
    }

    console.log('🎉 Admin user is ready');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('👤 Role: admin');
  } catch (err) {
    console.error('❌ Failed to seed admin user (Firebase):', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  ensureAdminUser().then(() => process.exit(0));
}

module.exports = { ensureAdminUser };


