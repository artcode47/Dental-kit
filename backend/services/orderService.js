const FirebaseService = require('./firebaseService');
const unifiedStore = require('./unifiedStore');

class OrderService extends FirebaseService {
  constructor() {
    super('orders');
    this.cacheTTL = 300; // 5 minutes for order data
    this.userOrdersCacheTTL = 600; // 10 minutes for user orders
  }

  // Enhanced caching methods
  async getCacheKey(operation, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `orders:${operation}:${sortedParams}`;
  }

  // Admin: Get orders list with filtering, sorting and pagination
  async getOrders(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        paymentStatus,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Base fetch: limit to a reasonable set for in-memory processing
      let query = this.collectionRef;

      // Apply at most one equality filter to avoid composite indexes
      if (status) {
        query = query.where('status', '==', status);
      } else if (paymentStatus) {
        query = query.where('paymentStatus', '==', paymentStatus);
      }

      // Fetch up to 3x requested page size for in-memory sorting/pagination
      const maxFetch = Math.min((limit || 20) * 3, 500);
      query = query.limit(maxFetch);

      const snapshot = await query.get();
      const ordersRaw = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const converted = this.convertTimestamps(data);
        ordersRaw.push({ id: doc.id, ...converted });
      });

      // In-memory filtering
      let orders = ordersRaw;

      if (status && !query._query?.filters?.some(f => f.field === 'status')) {
        orders = orders.filter(o => o.status === status);
      }
      if (paymentStatus && !query._query?.filters?.some(f => f.field === 'paymentStatus')) {
        orders = orders.filter(o => o.paymentStatus === paymentStatus);
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        orders = orders.filter(o => new Date(o.createdAt || 0) >= from);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        orders = orders.filter(o => new Date(o.createdAt || 0) <= to);
      }
      if (search) {
        const s = String(search).toLowerCase();
        orders = orders.filter(o => {
          if (o.orderNumber && String(o.orderNumber).toLowerCase().includes(s)) return true;
          if (o.status && String(o.status).toLowerCase().includes(s)) return true;
          if (Array.isArray(o.items)) {
            return o.items.some(it => (it.name && String(it.name).toLowerCase().includes(s)) || (it.productId && String(it.productId).toLowerCase().includes(s)));
          }
          return false;
        });
      }

      // In-memory sort
      orders.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
        }
        if (aVal === undefined) aVal = 0;
        if (bVal === undefined) bVal = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal);
          return sortOrder === 'asc' ? cmp : -cmp;
        }
        return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });

      // Pagination
      const total = orders.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = orders.slice(start, end);

      // Populate user information for each order
      const ordersWithUsers = await Promise.all(
        paginated.map(async (order) => {
          try {
            if (order.userId) {
              const UserService = require('./userService');
              const userService = new UserService();
              const user = await userService.getById(order.userId);
              if (user) {
                return {
                  ...order,
                  user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                  }
                };
              }
            }
            return order;
          } catch (error) {
            console.warn(`Failed to fetch user data for order ${order.id}:`, error.message);
            return order;
          }
        })
      );

      return {
        orders: ordersWithUsers,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        hasNextPage: end < total,
        hasPrevPage: start > 0
      };
    } catch (error) {
      throw new Error(`Error getting orders: ${error.message}`);
    }
  }

  // Admin: bulk operations
  async bulkOrderOperations(operation, orderIds, data = {}) {
    try {
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return { message: 'No orders selected' };
      }

      switch (operation) {
        case 'updateStatus': {
          const { status } = data;
          if (!status) throw new Error('Status is required');
          for (const id of orderIds) {
            await this.updateOrderStatus(id, status);
          }
          return { message: 'Order status updated' };
        }
        case 'updatePaymentStatus': {
          const { paymentStatus } = data;
          if (!paymentStatus) throw new Error('Payment status is required');
          for (const id of orderIds) {
            await this.updateOrder(id, { paymentStatus, updatedAt: new Date() });
          }
          return { message: 'Order payment status updated' };
        }
        case 'delete': {
          for (const id of orderIds) {
            await this.delete(id);
          }
          return { message: 'Orders deleted successfully' };
        }
        default:
          throw new Error('Invalid operation');
      }
    } catch (error) {
      throw new Error(`Error performing bulk order operations: ${error.message}`);
    }
  }

  async getFromCache(cacheKey) {
    try {
      return await unifiedStore.getCache(cacheKey);
    } catch (error) {
      console.warn('Order cache read failed:', error.message);
      return null;
    }
  }

  async setCache(cacheKey, data, ttl = this.cacheTTL) {
    try {
      await unifiedStore.setCache(cacheKey, data, ttl);
    } catch (error) {
      console.warn('Order cache write failed:', error.message);
    }
  }

  async invalidateUserOrders(userId) {
    try {
      const patterns = [
        `orders:getUserOrders:${userId}`,
        `orders:getRecentOrders:${userId}`,
        `orders:userOrders:${userId}`
      ];
      
      for (const pattern of patterns) {
        await unifiedStore.deleteCache(pattern);
      }
    } catch (error) {
      console.warn('Order cache invalidation failed:', error.message);
    }
  }

  // Create order with cache invalidation
  async createOrder(orderData) {
    try {
      const order = {
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.create(order);
      
      // Invalidate user orders cache
      if (orderData.userId) {
        await this.invalidateUserOrders(orderData.userId);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Get user orders with caching and optimized querying
  async getUserOrders(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const cacheKey = await this.getCacheKey('getUserOrders', { userId, page, limit, status, sortBy, sortOrder });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use simple query without complex filtering to avoid index issues
      let query = this.collectionRef.where('userId', '==', userId);
      
      // Apply status filter if provided
      if (status) {
        query = query.where('status', '==', status);
      }

      // Get orders with reasonable limit for in-memory processing
      const maxFetch = Math.min(limit * 3, 100); // Fetch up to 3x the limit, max 100
      query = query.limit(maxFetch);

      const querySnapshot = await query.get();
      let orders = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        orders.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply additional filtering in memory (no composite index required)
      let filteredOrders = orders;

      // Apply status filter if not already applied
      if (status && !query._query?.filters?.some(f => f.field === 'status')) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }

      // Sort in memory to avoid composite index requirements
      filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        
        if (sortBy === 'createdAt') {
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // Handle other sort fields
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredOrders.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      const result = {
        orders: paginatedOrders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1
      };

      // Cache the result
      await this.setCache(cacheKey, result, this.userOrdersCacheTTL);
      
      return result;
    } catch (error) {
      throw new Error(`Error getting user orders: ${error.message}`);
    }
  }

  // Get recent orders with caching
  async getRecentOrders(userId, limit = 5) {
    try {
      const cacheKey = await this.getCacheKey('getRecentOrders', { userId, limit });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use simple query without complex filtering
      const querySnapshot = await this.collectionRef
        .where('userId', '==', userId)
        .limit(limit * 2); // Fetch more to account for filtering

      let orders = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        orders.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Sort in memory and limit results
      const recentOrders = orders
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        })
        .slice(0, limit);

      // Cache the result
      await this.setCache(cacheKey, recentOrders, this.userOrdersCacheTTL);
      
      return recentOrders;
    } catch (error) {
      throw new Error(`Error getting recent orders: ${error.message}`);
    }
  }

  // Get orders by status with caching
  async getOrdersByStatus(status, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const cacheKey = await this.getCacheKey('getOrdersByStatus', { status, page, limit, sortBy, sortOrder });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use simple query without complex filtering
      const querySnapshot = await this.collectionRef
        .where('status', '==', status)
        .limit(limit * 3); // Fetch more to account for sorting

      let orders = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        orders.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Sort in memory to avoid composite index requirements
      orders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        
        if (sortBy === 'createdAt') {
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // Handle other sort fields
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = orders.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = orders.slice(startIndex, endIndex);

      const result = {
        orders: paginatedOrders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1
      };

      // Cache the result
      await this.setCache(cacheKey, result, this.cacheTTL);
      
      return result;
    } catch (error) {
      throw new Error(`Error getting orders by status: ${error.message}`);
    }
  }

  // Get order by ID with caching
  async getOrderById(id) {
    try {
      const cacheKey = await this.getCacheKey('getOrderById', { id });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const order = await super.getById(id);
      
      if (order) {
        // Cache the order
        await this.setCache(cacheKey, order, this.cacheTTL * 2); // Longer cache for individual orders
      }
      
      return order;
    } catch (error) {
      throw new Error(`Error getting order: ${error.message}`);
    }
  }

  // Update order with cache invalidation
  async updateOrder(id, updateData) {
    try {
      const order = await super.update(id, updateData);
      
      // Invalidate relevant caches
      if (order.userId) {
        await this.invalidateUserOrders(order.userId);
      }
      
      // Clear order-specific cache
      const orderCacheKey = await this.getCacheKey('getOrderById', { id });
      await unifiedStore.deleteCache(orderCacheKey);
      
      return order;
    } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
  }

  // Update order status with cache invalidation
  async updateOrderStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: new Date(),
        ...additionalData
      };

      // Add status change timestamp
      if (status) {
        updateData[`${status}At`] = new Date();
      }

      const order = await this.updateOrder(id, updateData);
      
      return order;
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Cancel order with cache invalidation
  async cancelOrder(id, reason = 'User cancelled') {
    try {
      const updateData = {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date()
      };

      const order = await this.updateOrder(id, updateData);
      
      return order;
    } catch (error) {
      throw new Error(`Error cancelling order: ${error.message}`);
    }
  }

  // Get order statistics with caching
  async getOrderStats(userId = null) {
    try {
      const cacheKey = await this.getCacheKey('getOrderStats', { userId });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch orders for statistics
      let query = this.collectionRef;
      if (userId) {
        query = query.where('userId', '==', userId);
      }

      const querySnapshot = await query.limit(1000).get();
      const orders = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        orders.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Calculate statistics
      const stats = {
        total: orders.length,
        totalValue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0,
        byStatus: {},
        byMonth: {},
        recentActivity: []
      };

      // Count by status
      orders.forEach(order => {
        const status = order.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      });

      // Count by month
      orders.forEach(order => {
        if (order.createdAt) {
          const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
          stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        }
      });

      // Get recent activity (last 10 orders)
      stats.recentActivity = orders
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 10)
        .map(order => ({
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt
        }));

      // Cache the result with longer TTL
      await this.setCache(cacheKey, stats, this.cacheTTL * 4);
      
      return stats;
    } catch (error) {
      throw new Error(`Error getting order stats: ${error.message}`);
    }
  }

  // Search orders with caching
  async searchOrders(searchTerm, options = {}) {
    try {
      const {
        userId = null,
        page = 1,
        limit = 20
      } = options;

      const cacheKey = await this.getCacheKey('searchOrders', { searchTerm, userId, page, limit });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use simple query without complex filtering
      let query = this.collectionRef;
      if (userId) {
        query = query.where('userId', '==', userId);
      }

      const querySnapshot = await query.limit(limit * 3).get();
      let orders = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        orders.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply search filter in memory
      const searchLower = searchTerm.toLowerCase();
      const filteredOrders = orders.filter(order => 
        (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
        (order.status && order.status.toLowerCase().includes(searchLower)) ||
        (order.items && order.items.some(item => 
          item.name && item.name.toLowerCase().includes(searchLower)
        ))
      );

      // Sort by creation date
      filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      // Apply pagination
      const total = filteredOrders.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      const result = {
        orders: paginatedOrders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1
      };

      // Cache search results with shorter TTL
      await this.setCache(cacheKey, result, this.cacheTTL / 2);
      
      return result;
    } catch (error) {
      throw new Error(`Error searching orders: ${error.message}`);
    }
  }

  // Get order tracking information
  async getOrderTracking(orderId) {
    try {
      const cacheKey = await this.getCacheKey('getOrderTracking', { orderId });
      
      // Try cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Generate tracking information
      const tracking = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        timeline: this.generateOrderTimeline(order),
        currentLocation: order.currentLocation || 'Processing center',
        lastUpdate: order.updatedAt
      };

      // Cache the tracking info
      await this.setCache(cacheKey, tracking, this.cacheTTL);
      
      return tracking;
    } catch (error) {
      throw new Error(`Error getting order tracking: ${error.message}`);
    }
  }

  // Generate order timeline
  generateOrderTimeline(order) {
    const timeline = [];
    
    if (order.createdAt) {
      timeline.push({
        status: 'Order Placed',
        timestamp: order.createdAt,
        description: 'Your order has been placed successfully'
      });
    }

    if (order.confirmedAt) {
      timeline.push({
        status: 'Order Confirmed',
        timestamp: order.confirmedAt,
        description: 'Your order has been confirmed and is being processed'
      });
    }

    if (order.processingAt) {
      timeline.push({
        status: 'Processing',
        timestamp: order.processingAt,
        description: 'Your order is being prepared for shipment'
      });
    }

    if (order.shippedAt) {
      timeline.push({
        status: 'Shipped',
        timestamp: order.shippedAt,
        description: 'Your order has been shipped'
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        status: 'Delivered',
        timestamp: order.deliveredAt,
        description: 'Your order has been delivered'
      });
    }

    if (order.cancelledAt) {
      timeline.push({
        status: 'Cancelled',
        timestamp: order.cancelledAt,
        description: order.cancellationReason || 'Order was cancelled'
      });
    }

    // Sort timeline by timestamp
    return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Clear all order caches
  async clearAllCaches() {
    try {
      await unifiedStore.clearCache('orders:*');
      console.log('✅ All order caches cleared');
    } catch (error) {
      console.error('❌ Error clearing order caches:', error);
    }
  }
}

module.exports = OrderService;
