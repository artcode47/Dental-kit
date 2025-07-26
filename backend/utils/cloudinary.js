const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'dental-kit-store') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      eager: [
        { width: 300, height: 300, crop: 'fill', quality: 'auto:good' },
        { width: 600, height: 600, crop: 'fill', quality: 'auto:good' }
      ],
      eager_async: true,
      eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL || null,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'dental-kit-store') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
const deleteImage = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Delete multiple images
const deleteMultipleImages = async (public_ids) => {
  try {
    const deletePromises = public_ids.map(public_id => deleteImage(public_id));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple image deletion failed: ${error.message}`);
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (public_id, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options,
  };

  return cloudinary.url(public_id, defaultOptions);
};

// Generate thumbnail URL
const getThumbnailUrl = (public_id, width = 300, height = 300) => {
  return cloudinary.url(public_id, {
    width,
    height,
    crop: 'fill',
    quality: 'auto:good',
  });
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  getThumbnailUrl,
}; 