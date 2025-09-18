const VendorService = require('../services/vendorService');
const ProductService = require('../services/productService');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

const vendorService = new VendorService();
const productService = new ProductService();

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, isVerified } = req.query;
    const filters = {};
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    
    if (isVerified !== undefined) {
      filters.isVerified = isVerified === 'true';
    }

    const vendors = await vendorService.getAll({
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = vendors.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedVendors = vendors.slice(startIndex, endIndex);

    res.json({
      vendors: paginatedVendors,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
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