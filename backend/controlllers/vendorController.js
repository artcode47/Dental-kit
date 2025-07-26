const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { uploadSingle, handleUploadError, cleanupUploads } = require('../middleware/upload');

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, isVerified } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    const vendors = await Vendor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments(query);

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

// Get single vendor
exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
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
    const vendor = await Vendor.findOne({ slug: req.params.slug });
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
    
    const products = await Product.find({ vendor: req.params.id, isActive: true })
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ vendor: req.params.id, isActive: true });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
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
      email,
      phone,
      address,
      description,
      website,
      taxId,
      contactPerson,
      paymentTerms
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    const vendorData = {
      name,
      email,
      phone,
      address,
      description,
      website,
      taxId,
      contactPerson,
      paymentTerms
    };

    // Handle logo upload if provided
    if (req.file) {
      const imageResult = await uploadImage(req.file, 'vendors');
      vendorData.logo = {
        public_id: imageResult.public_id,
        url: imageResult.url,
      };
    }

    const vendor = await Vendor.create(vendorData);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating vendor', error: error.message });
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      description,
      website,
      taxId,
      contactPerson,
      paymentTerms,
      isActive,
      isVerified
    } = req.body;
    
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== vendor.email) {
      const existingVendor = await Vendor.findOne({ email, _id: { $ne: req.params.id } });
      if (existingVendor) {
        return res.status(400).json({ message: 'Vendor with this email already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (paymentTerms) updateData.paymentTerms = paymentTerms;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

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

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vendor', error: error.message });
  }
};

// Delete vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if vendor has products
    const productCount = await Product.countDocuments({ vendor: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vendor with existing products. Please remove or reassign products first.' 
      });
    }

    // Delete logo from Cloudinary if exists
    if (vendor.logo && vendor.logo.public_id) {
      await deleteImage(vendor.logo.public_id);
    }

    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vendor', error: error.message });
  }
};

// Toggle vendor status
exports.toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling vendor status', error: error.message });
  }
};

// Verify vendor
exports.verifyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isVerified = true;
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying vendor', error: error.message });
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