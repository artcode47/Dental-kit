const VendorService = require('../services/vendorService');
const ProductService = require('../services/productService');
const OrderService = require('../services/orderService');
const UserService = require('../services/userService');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

const vendorService = new VendorService();
const productService = new ProductService();
const orderService = new OrderService();
const userService = new UserService();

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, isVerified, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status: isActive !== undefined ? (isActive === 'true' ? 'active' : 'inactive') : undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      search,
      sortBy,
      sortOrder,
      includeProductCount: true // Added this option
    };

    const result = await vendorService.getVendors(options);

    res.json({
      vendors: result.vendors,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

// Get single vendor
exports.getVendor = async (req, res) => {
  try {
    const vendor = await vendorService.getById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor', error: error.message });
  }
};

// Get vendor by slug
exports.getVendorBySlug = async (req, res) => {
  try {
    const vendor = await vendorService.getVendorBySlug(req.params.slug);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor', error: error.message });
  }
};

// Get vendor products
exports.getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const products = await productService.getAll({
      filters: { vendorId: req.params.id, isActive: true },
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = products.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor products', error: error.message });
  }
};

// Vendor self routes
exports.getMyProfile = async (req, res) => {
  try {
    // Assuming vendor user uses same users collection with role 'vendor'
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const updateData = req.body;

    // Handle profile image upload if provided
    if (req.file) {
      // Delete old profile image if exists
      if (req.user.profileImage && req.user.profileImage.public_id) {
        await deleteImage(req.user.profileImage.public_id);
      }

      const imageResult = await uploadImage(req.file, 'vendor-profiles');
      updateData.profileImage = {
        public_id: imageResult.public_id,
        url: imageResult.url,
      };
    }

    // Update user profile
    const updatedUser = await userService.updateUser(req.user.id, updateData);
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const result = await productService.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      vendor: req.user.id,
      sortBy,
      sortOrder
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.createMyProduct = async (req, res) => {
  try {
    const data = req.body;
    
    // Handle product images upload if provided
    if (req.files && req.files.length > 0) {
      const uploadedImages = [];
      for (const file of req.files) {
        const imageResult = await uploadImage(file, 'products');
        uploadedImages.push({
          public_id: imageResult.public_id,
          url: imageResult.url,
        });
      }
      data.images = uploadedImages;
    }

    const product = await productService.createProduct({
      ...data,
      vendorId: req.user.id,
      brand: data.brand || req.user.company || req.user.firstName || 'Vendor',
    });
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

exports.updateMyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await productService.getProductById(id);
    if (!existing || existing.vendorId !== req.user.id) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const nextData = { ...req.body };
    
    // Handle product images upload if provided
    if (req.files && req.files.length > 0) {
      // Delete old images if they exist
      if (existing.images && existing.images.length > 0) {
        for (const image of existing.images) {
          if (image.public_id) {
            await deleteImage(image.public_id);
          }
        }
      }
      
      const uploadedImages = [];
      for (const file of req.files) {
        const imageResult = await uploadImage(file, 'products');
        uploadedImages.push({
          public_id: imageResult.public_id,
          url: imageResult.url,
        });
      }
      nextData.images = uploadedImages;
    }
    
    if (!nextData.brand) {
      nextData.brand = req.user.company || req.user.firstName || 'Vendor';
    }
    const product = await productService.updateProduct(id, nextData);
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

exports.updateMyProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'decrease' } = req.body;
    const existing = await productService.getProductById(id);
    if (!existing || existing.vendorId !== req.user.id) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const result = await productService.updateStock(id, quantity, operation);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product stock', error: error.message });
  }
};

exports.deleteMyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await productService.getProductById(id);
    if (!existing || existing.vendorId !== req.user.id) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await productService.deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    // Products owned by vendor
    const productsResult = await productService.getProducts({ vendor: req.user.id, limit: 1000 });
    const products = productsResult.products || [];

    // Build a Set of vendor product IDs to filter orders
    const vendorProductIds = new Set(products.map(p => p.id));

    // Fetch orders and filter to those containing vendor products
    const allOrdersResp = await orderService.getOrders({ limit: 500 });
    const allOrders = allOrdersResp.orders || [];
    const vendorOrders = allOrders.filter(o => Array.isArray(o.items) && o.items.some(it => vendorProductIds.has(it.productId)));

    const totalOrders = vendorOrders.length;
    const totalSales = vendorOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const topProducts = [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 5);
    const leastProducts = [...products].sort((a, b) => (a.totalSold || 0) - (b.totalSold || 0)).slice(0, 5);
    res.json({
      totals: {
        products: products.length,
        totalOrders,
        totalSales,
        inStock: products.filter(p => (p.stock || 0) > 0).length
      },
      topProducts,
      leastProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor stats', error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // Products owned by vendor
    const productsResult = await productService.getProducts({ vendor: req.user.id, limit: 1000 });
    const products = productsResult.products || [];
    const vendorProductIds = new Set(products.map(p => p.id));

    // Pull a reasonable slice of orders then filter
    const ordersResp = await orderService.getOrders({ page: 1, limit: 500, sortBy: 'createdAt', sortOrder: 'desc' });
    const allOrders = ordersResp.orders || [];
    const matched = allOrders.filter(o => Array.isArray(o.items) && o.items.some(it => vendorProductIds.has(it.productId)));

    // Paginate in-memory
    const p = parseInt(page);
    const l = parseInt(limit);
    const start = (p - 1) * l;
    const end = start + l;
    const paginated = matched.slice(start, end);

    res.json({
      orders: paginated,
      total: matched.length,
      totalPages: Math.ceil(matched.length / l),
      currentPage: p,
      hasNextPage: end < matched.length,
      hasPrevPage: start > 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor orders', error: error.message });
  }
};

// Create vendor
exports.createVendor = async (req, res) => {
  try {
    const {
      name,
      nameAr,
      email,
      phone,
      address,
      description,
      website,
      taxId,
      contactPerson,
      paymentTerms,
      commissionRate,
      isActive,
      isVerified
    } = req.body;

    const vendorData = {
      name,
      nameAr,
      email,
      phone,
      address,
      description,
      website,
      taxId,
      contactPerson,
      paymentTerms: paymentTerms || 'net30',
      commissionRate: commissionRate || 10,
      isActive: isActive !== undefined ? isActive : true,
      isVerified: isVerified !== undefined ? isVerified : false,
      slug: vendorService.generateSlug(name),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle logo upload if provided
    if (req.file) {
      const imageResult = await uploadImage(req.file, 'vendors');
      vendorData.logo = {
        public_id: imageResult.public_id,
        url: imageResult.url,
      };
    }

    const vendor = await vendorService.create(vendorData);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating vendor', error: error.message });
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vendor = await vendorService.getById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Handle logo upload if provided
    if (req.file) {
      // Delete old logo if exists
      if (vendor.logo && vendor.logo.public_id) {
        await deleteImage(vendor.logo.public_id);
      }

      const imageResult = await uploadImage(req.file, 'vendors');
      updateData.logo = {
        public_id: imageResult.public_id,
        url: imageResult.url,
      };
    }

    // Generate new slug if name is being updated
    if (updateData.name && updateData.name !== vendor.name) {
      updateData.slug = vendorService.generateSlug(updateData.name);
    }

    const updatedVendor = await vendorService.update(id, updateData);
    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vendor', error: error.message });
  }
};

// Delete vendor
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.getById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Delete logo from Cloudinary if exists
    if (vendor.logo && vendor.logo.public_id) {
      await deleteImage(vendor.logo.public_id);
    }

    await vendorService.delete(id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vendor', error: error.message });
  }
};

// Toggle vendor status
exports.toggleVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.getById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await vendorService.update(id, {
      isActive: !vendor.isActive
    });

    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling vendor status', error: error.message });
  }
};

// Verify vendor
exports.verifyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.getById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedVendor = await vendorService.update(id, {
      isVerified: !vendor.isVerified
    });

    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying vendor', error: error.message });
  }
};

// Get vendor statistics
exports.getVendorStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.getById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const stats = await vendorService.getVendorStats(id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor stats', error: error.message });
  }
};

// Upload vendor logo
exports.uploadVendorLogo = [
  uploadSingle,
  handleUploadError,
  cleanupUploads,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const imageResult = await uploadImage(req.file, 'vendors');
      res.json({
        public_id: imageResult.public_id,
        url: imageResult.url,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading logo', error: error.message });
    }
  }
]; 