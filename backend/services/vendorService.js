const FirebaseService = require('./firebaseService');

class VendorService extends FirebaseService {
  constructor() {
    super('vendors');
  }

  // Create a new vendor
  async createVendor(vendorData) {
    try {
      const vendor = {
        ...vendorData,
        isActive: true,
        isVerified: false,
        rating: 0,
        totalProducts: 0,
        totalSales: 0,
        totalOrders: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(vendor);
    } catch (error) {
      throw new Error(`Error creating vendor: ${error.message}`);
    }
  }

  // Get all vendors with filtering, sorting, and pagination
  async getVendors(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        isVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      let filters = [];

      if (status) {
        if (status === 'active') {
          filters.push({ field: 'isActive', operator: '==', value: true });
        } else if (status === 'inactive') {
          filters.push({ field: 'isActive', operator: '==', value: false });
        }
      }

      if (isVerified !== undefined) {
        filters.push({ field: 'isVerified', operator: '==', value: isVerified });
      }

      const vendors = await this.getAll({
        filters,
        sortBy,
        sortOrder,
        limitCount: limit
      });

      // Apply search filter if provided
      let filteredVendors = vendors;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredVendors = vendors.filter(vendor => 
          vendor.name.toLowerCase().includes(searchLower) ||
          vendor.email.toLowerCase().includes(searchLower) ||
          vendor.description?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = filteredVendors.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedVendors = filteredVendors.slice(startIndex, endIndex);

      return {
        vendors: paginatedVendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error getting vendors: ${error.message}`);
    }
  }

  // Get vendor by ID
  async getVendorById(id) {
    try {
      const vendor = await this.getById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      return vendor;
    } catch (error) {
      throw new Error(`Error getting vendor: ${error.message}`);
    }
  }

  // Update vendor
  async updateVendor(id, updateData) {
    try {
      const vendor = await this.getById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const updatedVendor = await this.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedVendor;
    } catch (error) {
      throw new Error(`Error updating vendor: ${error.message}`);
    }
  }

  // Delete vendor (soft delete)
  async deleteVendor(id) {
    try {
      const vendor = await this.getById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      await this.update(id, {
        isActive: false,
        updatedAt: new Date()
      });

      return { message: 'Vendor deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting vendor: ${error.message}`);
    }
  }

  // Verify vendor
  async verifyVendor(id) {
    try {
      const vendor = await this.getById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const updatedVendor = await this.update(id, {
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date()
      });

      return updatedVendor;
    } catch (error) {
      throw new Error(`Error verifying vendor: ${error.message}`);
    }
  }

  // Unverify vendor
  async unverifyVendor(id) {
    try {
      const vendor = await this.getById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const updatedVendor = await this.update(id, {
        isVerified: false,
        verifiedAt: null,
        updatedAt: new Date()
      });

      return updatedVendor;
    } catch (error) {
      throw new Error(`Error unverifying vendor: ${error.message}`);
    }
  }

  // Get vendor by email
  async getVendorByEmail(email) {
    try {
      return await this.findOneBy('email', email);
    } catch (error) {
      throw new Error(`Error getting vendor by email: ${error.message}`);
    }
  }

  // Search vendors
  async searchVendors(searchTerm, options = {}) {
    try {
      const vendors = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });
      
      const searchLower = searchTerm.toLowerCase();
      const filteredVendors = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.email.toLowerCase().includes(searchLower) ||
        vendor.description?.toLowerCase().includes(searchLower)
      );

      return filteredVendors;
    } catch (error) {
      throw new Error(`Error searching vendors: ${error.message}`);
    }
  }

  // Get top performing vendors
  async getTopVendors(limit = 10) {
    try {
      const vendors = await this.getAll({
        filters: [
          { field: 'isActive', operator: '==', value: true },
          { field: 'isVerified', operator: '==', value: true }
        ],
        sortBy: 'totalSales',
        sortOrder: 'desc',
        limitCount: limit
      });

      return vendors;
    } catch (error) {
      throw new Error(`Error getting top vendors: ${error.message}`);
    }
  }

  // Update vendor statistics
  async updateVendorStats(vendorId, stats) {
    try {
      const vendor = await this.getById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const updateData = {
        ...stats,
        updatedAt: new Date()
      };

      const updatedVendor = await this.update(vendorId, updateData);
      return updatedVendor;
    } catch (error) {
      throw new Error(`Error updating vendor stats: ${error.message}`);
    }
  }

  // Get vendor analytics
  async getVendorAnalytics(vendorId, period = '30d') {
    try {
      const vendor = await this.getById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Calculate period start date
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Note: This would need integration with order and product services
      // For now, returning basic vendor info
      return {
        vendorId,
        vendorName: vendor.name,
        period,
        startDate,
        // Additional analytics would be calculated here
        totalProducts: vendor.totalProducts || 0,
        totalSales: vendor.totalSales || 0,
        totalOrders: vendor.totalOrders || 0,
        rating: vendor.rating || 0
      };
    } catch (error) {
      throw new Error(`Error getting vendor analytics: ${error.message}`);
    }
  }

  // Bulk vendor operations
  async bulkVendorOperations(operation, vendorIds, data = {}) {
    try {
      if (!operation || !vendorIds || !Array.isArray(vendorIds)) {
        throw new Error('Operation and vendor IDs array are required');
      }

      const updates = vendorIds.map(id => ({ id, data: {} }));

      switch (operation) {
        case 'activate':
          updates.forEach(update => {
            update.data.isActive = true;
            update.data.updatedAt = new Date();
          });
          break;
        case 'deactivate':
          updates.forEach(update => {
            update.data.isActive = false;
            update.data.updatedAt = new Date();
          });
          break;
        case 'verify':
          updates.forEach(update => {
            update.data.isVerified = true;
            update.data.verifiedAt = new Date();
            update.data.updatedAt = new Date();
          });
          break;
        case 'unverify':
          updates.forEach(update => {
            update.data.isVerified = false;
            update.data.verifiedAt = null;
            update.data.updatedAt = new Date();
          });
          break;
        case 'update':
          updates.forEach(update => {
            update.data = { ...data, updatedAt: new Date() };
          });
          break;
        default:
          throw new Error('Invalid operation');
      }

      await this.batchUpdate(updates);
      return { message: `Bulk operation '${operation}' completed successfully` };
    } catch (error) {
      throw new Error(`Error performing bulk vendor operations: ${error.message}`);
    }
  }
}

module.exports = VendorService;

