/**
 * Image URL utility functions for handling Cloudinary images
 * Supports multiple image formats and provides fallbacks
 */

/**
 * Get the URL from an image object or string
 * Handles various formats:
 * - String URL: "https://res.cloudinary.com/..."
 * - Object with url: { url: "https://res.cloudinary.com/...", public_id: "..." }
 * - Object with src: { src: "https://res.cloudinary.com/...", alt: "..." }
 * - Array of images: [{ url: "..." }, { url: "..." }]
 * @param {string|object|array} image - Image data in various formats
 * @param {number} index - Index for array of images (default: 0)
 * @returns {string} - Image URL or fallback
 */
export const getImageUrl = (image, index = 0) => {
  // Handle null/undefined
  if (!image) {
    return '/placeholder-product.svg';
  }

  // Handle string URLs
  if (typeof image === 'string') {
    return image;
  }

  // Handle array of images
  if (Array.isArray(image)) {
    if (image.length === 0) {
      return '/placeholder-product.svg';
    }
    const img = image[index] || image[0];
    return getImageUrl(img);
  }

  // Handle object with url property
  if (image.url) {
    return image.url;
  }

  // Handle object with src property
  if (image.src) {
    return image.src;
  }

  // Handle object with public_id (Cloudinary format)
  if (image.public_id) {
    // This would need Cloudinary URL generation, but for now return placeholder
    return '/placeholder-product.svg';
  }

  // Fallback
  return '/placeholder-product.svg';
};

/**
 * Get the first image URL from an array or single image
 * @param {string|object|array} images - Image data
 * @returns {string} - First image URL or fallback
 */
export const getFirstImageUrl = (images) => {
  return getImageUrl(images, 0);
};

/**
 * Get all image URLs from an array or single image
 * @param {string|object|array} images - Image data
 * @returns {array} - Array of image URLs
 */
export const getAllImageUrls = (images) => {
  if (!images) {
    return ['/placeholder-product.svg'];
  }

  if (typeof images === 'string') {
    return [images];
  }

  if (Array.isArray(images)) {
    if (images.length === 0) {
      return ['/placeholder-product.svg'];
    }
    return images.map(img => getImageUrl(img));
  }

  // Single object
  return [getImageUrl(images)];
};

/**
 * Get optimized image URL with Cloudinary transformations
 * @param {string|object} image - Image data
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (image, options = {}) => {
  const baseUrl = getImageUrl(image);
  
  // If it's not a Cloudinary URL, return as is
  if (!baseUrl.includes('res.cloudinary.com')) {
    return baseUrl;
  }

  // Default optimization options
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options
  };

  // Build transformation string
  const transformations = [];
  
  if (defaultOptions.width) transformations.push(`w_${defaultOptions.width}`);
  if (defaultOptions.height) transformations.push(`h_${defaultOptions.height}`);
  if (defaultOptions.crop) transformations.push(`c_${defaultOptions.crop}`);
  if (defaultOptions.quality) transformations.push(`q_${defaultOptions.quality}`);
  if (defaultOptions.fetch_format) transformations.push(`f_${defaultOptions.fetch_format}`);

  if (transformations.length === 0) {
    return baseUrl;
  }

  // Insert transformations into Cloudinary URL
  const urlParts = baseUrl.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
  }

  return baseUrl;
};

/**
 * Get thumbnail image URL (300x300, fill crop)
 * @param {string|object} image - Image data
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (image) => {
  return getOptimizedImageUrl(image, {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto:good'
  });
};

/**
 * Get medium image URL (600x600, fill crop)
 * @param {string|object} image - Image data
 * @returns {string} - Medium image URL
 */
export const getMediumImageUrl = (image) => {
  return getOptimizedImageUrl(image, {
    width: 600,
    height: 600,
    crop: 'fill',
    quality: 'auto:good'
  });
};

/**
 * Get large image URL (1200x1200, limit crop)
 * @param {string|object} image - Image data
 * @returns {string} - Large image URL
 */
export const getLargeImageUrl = (image) => {
  return getOptimizedImageUrl(image, {
    width: 1200,
    height: 1200,
    crop: 'limit',
    quality: 'auto:good'
  });
};

/**
 * Check if an image URL is valid
 * @param {string} url - Image URL
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Check if it's a placeholder
  if (url.includes('placeholder') || url.includes('via.placeholder.com')) {
    return false;
  }
  
  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get image alt text
 * @param {string|object} image - Image data
 * @param {string} fallback - Fallback alt text
 * @returns {string} - Alt text
 */
export const getImageAlt = (image, fallback = 'Product image') => {
  if (!image) {
    return fallback;
  }

  if (typeof image === 'string') {
    return fallback;
  }

  if (image.alt) {
    return image.alt;
  }

  if (image.title) {
    return image.title;
  }

  return fallback;
};

export default {
  getImageUrl,
  getFirstImageUrl,
  getAllImageUrls,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getMediumImageUrl,
  getLargeImageUrl,
  isValidImageUrl,
  getImageAlt
};
