const Product = require('../models/Product');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const { uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');
const { uploadMultiple, handleUploadError, cleanupUploads } = require('../middleware/upload');
const { 
  advancedSearch, 
  getSearchSuggestions, 
  getPopularSearches, 
  getProductRecommendations,
  updateProductInIndex 
} = require('../utils/searchEngine');

// Get all products with advanced filtering and search
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      vendor,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      isOnSale,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      brand,
      tags
    } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by vendor
    if (vendor) {
      query.vendor = vendor;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    if (isOnSale !== undefined) {
      query.isOnSale = isOnSale === 'true';
    }

    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('vendor', 'name slug logo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('vendor', 'name slug logo description');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('vendor', 'name slug logo description');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      vendor,
      stock,
      brand,
      specifications,
      features,
      weight,
      dimensions,
      isActive,
      isFeatured,
      isOnSale,
      salePercentage,
      tags,
      metaTitle,
      metaDescription
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Validate vendor exists
    const vendorExists = await Vendor.findById(vendor);
    if (!vendorExists) {
      return res.status(400).json({ message: 'Vendor not found' });
    }

    const productData = {
      name,
      description,
      shortDescription,
      price: parseFloat(price),
      category,
      vendor,
      stock: parseInt(stock),
      brand,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      isOnSale: isOnSale !== undefined ? isOnSale : false,
      tags: tags ? tags.split(',') : [],
      metaTitle,
      metaDescription
    };

    if (originalPrice) productData.originalPrice = parseFloat(originalPrice);
    if (salePercentage) productData.salePercentage = parseFloat(salePercentage);
    if (weight) productData.weight = parseFloat(weight);
    if (dimensions) productData.dimensions = dimensions;
    if (specifications) productData.specifications = specifications;
    if (features) productData.features = features.split(',');

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      const imageResults = await uploadMultipleImages(req.files, 'products');
      productData.images = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url,
        alt: `${name} product image`
      }));
    }

    const product = await Product.create(productData);

    // Update vendor's total products count
    await Vendor.findByIdAndUpdate(vendor, { $inc: { totalProducts: 1 } });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('vendor', 'name slug logo');

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {};

    // Update basic fields
    const fields = [
      'name', 'description', 'shortDescription', 'price', 'originalPrice',
      'stock', 'brand', 'isActive', 'isFeatured', 'isOnSale', 'salePercentage',
      'tags', 'metaTitle', 'metaDescription', 'weight', 'dimensions',
      'specifications', 'features'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'originalPrice' || field === 'salePercentage' || field === 'weight') {
          updateData[field] = parseFloat(req.body[field]);
        } else if (field === 'stock') {
          updateData[field] = parseInt(req.body[field]);
        } else if (field === 'tags') {
          updateData[field] = req.body[field].split(',');
        } else if (field === 'features') {
          updateData[field] = req.body[field].split(',');
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // Update category if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
      updateData.category = req.body.category;
    }

    // Update vendor if provided
    if (req.body.vendor) {
      const vendorExists = await Vendor.findById(req.body.vendor);
      if (!vendorExists) {
        return res.status(400).json({ message: 'Vendor not found' });
      }
      
      // Update vendor product counts
      if (product.vendor.toString() !== req.body.vendor) {
        await Vendor.findByIdAndUpdate(product.vendor, { $inc: { totalProducts: -1 } });
        await Vendor.findByIdAndUpdate(req.body.vendor, { $inc: { totalProducts: 1 } });
      }
      
      updateData.vendor = req.body.vendor;
    }

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      const imageResults = await uploadMultipleImages(req.files, 'products');
      const newImages = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url,
        alt: `${req.body.name || product.name} product image`
      }));

      // Keep existing images and add new ones
      updateData.images = [...product.images, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug').populate('vendor', 'name slug logo');

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }

    // Update vendor's total products count
    await Vendor.findByIdAndUpdate(product.vendor, { $inc: { totalProducts: -1 } });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = product.images.id(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await deleteMultipleImages([image.public_id]);

    // Remove from product
    product.images.pull(imageId);
    await product.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .populate('vendor', 'name slug logo')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error: error.message });
  }
};

// Get products on sale
exports.getProductsOnSale = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ isOnSale: true, isActive: true })
      .populate('category', 'name slug')
      .populate('vendor', 'name slug logo')
      .limit(parseInt(limit))
      .sort({ salePercentage: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products on sale', error: error.message });
  }
};

// Advanced search products
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10, ...filters } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchResult = await advancedSearch(q, { ...filters, limit: parseInt(limit) }, req.user?._id);
    res.json(searchResult);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};

// Get search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await getSearchSuggestions(q, parseInt(limit));
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Error getting search suggestions', error: error.message });
  }
};

// Get popular searches
exports.getPopularSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularSearches = await getPopularSearches(parseInt(limit));
    res.json({ popularSearches });
  } catch (error) {
    res.status(500).json({ message: 'Error getting popular searches', error: error.message });
  }
};

// Get product recommendations
exports.getProductRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const recommendations = await getProductRecommendations(req.user._id, parseInt(limit));
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
};

// Upload product images
exports.uploadProductImages = [
  uploadMultiple,
  handleUploadError,
  cleanupUploads,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }

      const imageResults = await uploadMultipleImages(req.files, 'products');
      const images = imageResults.map(result => ({
        public_id: result.public_id,
        url: result.url,
      }));

      res.json({ images });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
  }
]; 