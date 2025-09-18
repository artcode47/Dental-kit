const FirebaseService = require('./firebaseService');

class CouponService extends FirebaseService {
  constructor() {
    super('coupons');
  }

  // Create a new coupon
  async createCoupon(couponData) {
    try {
      const coupon = {
        ...couponData,
        usedCount: 0,
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(coupon);
    } catch (error) {
      throw new Error(`Error creating coupon: ${error.message}`);
    }
  }

  // Get all coupons with filtering, sorting, and pagination
  async getCoupons(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        discountType,
        isActive,
        isPublic,
        validFrom,
        validUntil,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      let filters = [];

      if (discountType) {
        filters.push({ field: 'discountType', operator: '==', value: discountType });
      }
      if (isActive !== undefined) {
        filters.push({ field: 'isActive', operator: '==', value: isActive });
      }
      if (isPublic !== undefined) {
        filters.push({ field: 'isPublic', operator: '==', value: isPublic });
      }

      const coupons = await this.getAll({
        filters,
        sortBy,
        sortOrder,
        limitCount: limit
      });

      // Apply date filters
      let filteredCoupons = coupons;
      if (validFrom) {
        const validFromDate = new Date(validFrom);
        filteredCoupons = filteredCoupons.filter(coupon => 
          new Date(coupon.validFrom) >= validFromDate
        );
      }
      if (validUntil) {
        const validUntilDate = new Date(validUntil);
        filteredCoupons = filteredCoupons.filter(coupon => 
          new Date(coupon.validUntil) <= validUntilDate
        );
      }

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCoupons = filteredCoupons.filter(coupon => 
          coupon.code.toLowerCase().includes(searchLower) ||
          coupon.name.toLowerCase().includes(searchLower) ||
          coupon.description?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = filteredCoupons.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex);

      return {
        coupons: paginatedCoupons,
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
      throw new Error(`Error getting coupons: ${error.message}`);
    }
  }

  // Get coupon by ID
  async getCouponById(id) {
    try {
      const coupon = await this.getById(id);
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      return coupon;
    } catch (error) {
      throw new Error(`Error getting coupon: ${error.message}`);
    }
  }

  // Get coupon by code
  async getCouponByCode(code) {
    try {
      return await this.findOneBy('code', code.toUpperCase());
    } catch (error) {
      throw new Error(`Error getting coupon by code: ${error.message}`);
    }
  }

  // Update coupon
  async updateCoupon(id, updateData) {
    try {
      const coupon = await this.getById(id);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const updatedCoupon = await this.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedCoupon;
    } catch (error) {
      throw new Error(`Error updating coupon: ${error.message}`);
    }
  }

  // Delete coupon
  async deleteCoupon(id) {
    try {
      const coupon = await this.getById(id);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      await this.delete(id);
      return { message: 'Coupon deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting coupon: ${error.message}`);
    }
  }

  // Validate coupon
  async validateCoupon(code, userId, orderAmount = 0) {
    try {
      const coupon = await this.getCouponByCode(code);
      if (!coupon) {
        return { valid: false, message: 'Coupon not found' };
      }

      if (!coupon.isActive) {
        return { valid: false, message: 'Coupon is inactive' };
      }

      const now = new Date();
      if (now < new Date(coupon.validFrom)) {
        return { valid: false, message: 'Coupon is not yet valid' };
      }

      if (now > new Date(coupon.validUntil)) {
        return { valid: false, message: 'Coupon has expired' };
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, message: 'Coupon usage limit reached' };
      }

      if (orderAmount < coupon.minimumOrderAmount) {
        return { 
          valid: false, 
          message: `Minimum order amount of ${coupon.minimumOrderAmount} required` 
        };
      }

      // Check user-specific restrictions
      if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
        if (!coupon.applicableUsers.includes(userId)) {
          return { valid: false, message: 'Coupon not applicable for this user' };
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maximumDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
        }
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
      }

      return {
        valid: true,
        coupon,
        discountAmount,
        message: 'Coupon is valid'
      };
    } catch (error) {
      throw new Error(`Error validating coupon: ${error.message}`);
    }
  }

  // Apply coupon
  async applyCoupon(code, userId, orderId) {
    try {
      const validation = await this.validateCoupon(code, userId);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const coupon = validation.coupon;

      // Increment usage count
      await this.update(coupon.id, {
        usedCount: coupon.usedCount + 1,
        updatedAt: new Date()
      });

      // Record usage (this would typically be in a separate usage tracking collection)
      const usageRecord = {
        couponId: coupon.id,
        userId,
        orderId,
        usedAt: new Date(),
        discountAmount: validation.discountAmount
      };

      return {
        success: true,
        coupon,
        discountAmount: validation.discountAmount,
        message: 'Coupon applied successfully'
      };
    } catch (error) {
      throw new Error(`Error applying coupon: ${error.message}`);
    }
  }

  // Get active coupons
  async getActiveCoupons(options = {}) {
    try {
      const now = new Date();
      const coupons = await this.getAll({
        filters: [
          { field: 'isActive', operator: '==', value: true },
          { field: 'isPublic', operator: '==', value: true }
        ],
        ...options
      });

      // Filter by date validity
      const activeCoupons = coupons.filter(coupon => {
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);
        return now >= validFrom && now <= validUntil;
      });

      return activeCoupons;
    } catch (error) {
      throw new Error(`Error getting active coupons: ${error.message}`);
    }
  }

  // Get expired coupons
  async getExpiredCoupons(options = {}) {
    try {
      const now = new Date();
      const coupons = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });

      const expiredCoupons = coupons.filter(coupon => {
        const validUntil = new Date(coupon.validUntil);
        return now > validUntil;
      });

      return expiredCoupons;
    } catch (error) {
      throw new Error(`Error getting expired coupons: ${error.message}`);
    }
  }

  // Search coupons
  async searchCoupons(searchTerm, options = {}) {
    try {
      const coupons = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });
      
      const searchLower = searchTerm.toLowerCase();
      const filteredCoupons = coupons.filter(coupon => 
        coupon.code.toLowerCase().includes(searchLower) ||
        coupon.name.toLowerCase().includes(searchLower) ||
        coupon.description?.toLowerCase().includes(searchLower)
      );

      return filteredCoupons;
    } catch (error) {
      throw new Error(`Error searching coupons: ${error.message}`);
    }
  }

  // Get coupon statistics
  async getCouponStats() {
    try {
      const coupons = await this.getAll();

      const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.isActive).length,
        inactive: coupons.filter(c => !c.isActive).length,
        public: coupons.filter(c => c.isPublic).length,
        private: coupons.filter(c => !c.isPublic).length,
        expired: 0,
        totalUsage: 0,
        totalDiscount: 0,
        byType: {
          percentage: 0,
          fixed: 0,
          free_shipping: 0
        }
      };

      const now = new Date();
      coupons.forEach(coupon => {
        if (new Date(coupon.validUntil) < now) {
          stats.expired++;
        }
        stats.totalUsage += coupon.usedCount || 0;
        if (stats.byType[coupon.discountType] !== undefined) {
          stats.byType[coupon.discountType]++;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Error getting coupon stats: ${error.message}`);
    }
  }

  // Bulk coupon operations
  async bulkCouponOperations(operation, couponIds, data = {}) {
    try {
      if (!operation || !couponIds || !Array.isArray(couponIds)) {
        throw new Error('Operation and coupon IDs array are required');
      }

      const updates = couponIds.map(id => ({ id, data: {} }));

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
        case 'makePublic':
          updates.forEach(update => {
            update.data.isPublic = true;
            update.data.updatedAt = new Date();
          });
          break;
        case 'makePrivate':
          updates.forEach(update => {
            update.data.isPublic = false;
            update.data.updatedAt = new Date();
          });
          break;
        case 'update':
          updates.forEach(update => {
            update.data = { ...data, updatedAt: new Date() };
          });
          break;
        case 'delete':
          await this.batchDelete(couponIds);
          return { message: `Bulk operation '${operation}' completed successfully` };
        default:
          throw new Error('Invalid operation');
      }

      await this.batchUpdate(updates);
      return { message: `Bulk operation '${operation}' completed successfully` };
    } catch (error) {
      throw new Error(`Error performing bulk coupon operations: ${error.message}`);
    }
  }
}

module.exports = CouponService;

