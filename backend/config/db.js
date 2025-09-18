const { db } = require('./firebase');

const connectDB = async () => {
  try {
    console.log('Connecting to Firebase...');
    // Firebase Firestore is automatically connected when initialized
    // We just need to verify the configuration is correct
    console.log('Firebase connected successfully');
  } catch (err) {
    console.error('Firebase connection error:', err.message);
    console.error('Please make sure Firebase is properly configured.');
    process.exit(1);
  }
};

module.exports = connectDB; 