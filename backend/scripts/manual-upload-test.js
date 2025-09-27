require('dotenv').config();
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Simple manual test for Cloudinary upload
async function testCloudinaryUpload() {
  console.log('🧪 Testing Cloudinary Upload...');
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('\n❌ Cloudinary environment variables are not properly configured!');
    console.log('Please check your .env file and ensure all Cloudinary variables are set.');
    return;
  }
  
  try {
    // Create a simple test image
    const testImagePath = path.join(__dirname, 'test-upload.png');
    
    // Create a simple 1x1 pixel PNG
    const samplePNG = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8E, 0x64, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, samplePNG);
    console.log('\n📁 Created test image:', testImagePath);
    
    // Create file object similar to what Multer would create
    const testFile = {
      path: testImagePath,
      originalname: 'test-upload.png',
      mimetype: 'image/png'
    };
    
    console.log('\n☁️ Uploading to Cloudinary...');
    const result = await uploadImage(testFile, 'test-uploads');
    
    console.log('\n✅ Upload successful!');
    console.log('📄 Upload details:');
    console.log('  Public ID:', result.public_id);
    console.log('  URL:', result.url);
    console.log('  Width:', result.width);
    console.log('  Height:', result.height);
    console.log('  Format:', result.format);
    console.log('  Size:', result.size, 'bytes');
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 Cleaned up test file');
    
    console.log('\n🎉 Cloudinary upload test completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Upload test failed:');
    console.log('Error:', error.message);
    
    // Clean up test file if it exists
    const testImagePath = path.join(__dirname, 'test-upload.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Cleaned up test file');
    }
  }
}

// Run the test
if (require.main === module) {
  testCloudinaryUpload();
}

module.exports = { testCloudinaryUpload };
