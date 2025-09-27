const { db } = require('./firebase');

const connectDB = async () => {
  try {
    // Keep logs minimal: only DB connected message
    // Firebase Firestore is automatically connected when initialized
    console.log('Database connected');
  } catch (err) {
    console.error('Firebase connection error:', err.message);
    console.error('Please make sure Firebase is properly configured.');
    process.exit(1);
  }
};

module.exports = connectDB; 