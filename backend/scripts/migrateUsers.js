const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find users that are missing the new profile fields
    const usersToUpdate = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { phone: { $exists: false } },
        { company: { $exists: false } },
        { university: { $exists: false } },
        { country: { $exists: false } },
        { governorate: { $exists: false } },
        { timezone: { $exists: false } },
        { language: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    // Update each user with default values
    for (const user of usersToUpdate) {
      const updateData = {};
      
      if (!user.firstName) updateData.firstName = '';
      if (!user.lastName) updateData.lastName = '';
      if (!user.phone) updateData.phone = '';
      if (!user.company) updateData.company = '';
      if (!user.university) updateData.university = '';
      if (!user.country) updateData.country = 'EG';
      if (!user.governorate) updateData.governorate = '';
      if (!user.timezone) updateData.timezone = 'EET';
      if (!user.language) updateData.language = 'en';

      await User.findByIdAndUpdate(user._id, updateData);
      console.log(`Updated user: ${user.email}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers(); 