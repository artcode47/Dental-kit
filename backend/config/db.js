const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://Hussammamdouh47:Hussam4716@cluster0.zshykfx.mongodb.net/';
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Please make sure MongoDB is running and the connection string is correct.');
    process.exit(1);
  }
};

module.exports = connectDB; 