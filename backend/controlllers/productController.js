const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');
const { uploadImage } = require('../utils/cloudinary');

const productService = new ProductService();
const categoryService = new CategoryService();

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      vendor,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      vendor,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
      search,
      sortBy,
      sortOrder
    };

    const result = await productService.getProducts(options);
    res.json(result);
  } catch (error) {
    console.error('Get products error:', error);
    // Soft-fail to avoid crashing the UI
    res.status(200).json({
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      diagnostics: { degraded: true, reason: 'products_fetch_failed' }
    });
  }
};

// Get product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json({ product });
  } catch (error) {
    // Only log unexpected errors, not "Product not found" errors
    if (!error.message.includes('Product not found')) {
      console.error('Get product error:', error);
    }
    res.status(404).json({ message: 'Product not found' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    // Pass through nameAr if provided
    const product = await productService.createProduct({ ...productData, nameAr: productData.nameAr });
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await productService.updateProduct(id, { ...updateData, nameAr: updateData.nameAr });
    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q: searchTerm, ...options } = req.query;
    const products = await productService.searchProducts(searchTerm, options);
    res.json({ products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    const products = await productService.getRelatedProducts(id, parseInt(limit));
    res.json({ products });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({ message: 'Error fetching related products' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const products = await productService.getProductsByCategory(categoryId, options);
    res.json({ products });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Error fetching products by category' });
  }
};

// Get products by vendor
exports.getProductsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const products = await productService.getProductsByVendor(vendorId, options);
    res.json({ products });
  } catch (error) {
    console.error('Get products by vendor error:', error);
    res.status(500).json({ message: 'Error fetching products by vendor' });
  }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'decrease' } = req.body;
    const result = await productService.updateStock(id, quantity, operation);
    res.json(result);
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({ message: 'Error updating product stock' });
  }
};

// Upload multiple product images
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }
    
    // Upload each file to Cloudinary sequentially to keep usage simple
    const uploaded = [];
    for (const file of req.files) {
      const result = await uploadImage(file, 'products');
      uploaded.push({ public_id: result.public_id, url: result.url });
    }

    res.json({ images: uploaded });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get category by ID
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(404).json({ message: 'Category not found' });
  }
};

// Get brands
exports.getBrands = async (req, res) => {
  try {
    // Get all products and extract unique brands
    const products = await productService.getAllSimple();
    const brands = [...new Set(products
      .filter(product => product.brand && product.isActive)
      .map(product => product.brand)
    )].sort();
    
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Error fetching brands' });
  }
}; 