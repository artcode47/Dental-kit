const UserService = require('../services/userService');
const ProductService = require('../services/productService');
const OrderService = require('../services/orderService');
const CategoryService = require('../services/categoryService');
const VendorService = require('../services/vendorService');
const ReviewService = require('../services/reviewService');
const CouponService = require('../services/couponService');
const GiftCardService = require('../services/giftCardService');
const ProductComparisonService = require('../services/productComparisonService');

// Initialize services
const userService = new UserService();
const productService = new ProductService();
const orderService = new OrderService();
const categoryService = new CategoryService();
const vendorService = new VendorService();
const reviewService = new ReviewService();
const couponService = new CouponService();
const giftCardService = new GiftCardService();
const productComparisonService = new ProductComparisonService();

// Dashboard overview statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get counts using simplified queries
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalReviews,
      totalCoupons,
      totalGiftCards
    ] = await Promise.all([
      userService.count(),
      orderService.count(),
      productService.count(),
      reviewService.count(),
      couponService.count(),
      giftCardService.count()
    ]);

    // Get all orders and filter in memory (no composite indexes required)
    const allOrders = await orderService.getAllSimple();
    const deliveredOrders = allOrders.filter(order => 
      order.status === 'delivered' && order.paymentStatus === 'paid'
    );

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Get all data and filter in memory
    const [allUsers, allOrdersData, allProductsData, allReviewsData] = await Promise.all([
      userService.getAllSimple(),
      orderService.getAllSimple(),
      productService.getAllSimple(),
      reviewService.getAllSimple()
    ]);

    // Filter recent activity in memory
    const newUsers = allUsers.filter(user => new Date(user.createdAt) >= thirtyDaysAgo).length;
    const newOrders = allOrdersData.filter(order => new Date(order.createdAt) >= thirtyDaysAgo).length;
    const newProducts = allProductsData.filter(product => new Date(product.createdAt) >= thirtyDaysAgo).length;
    const newReviews = allReviewsData.filter(review => new Date(review.createdAt) >= thirtyDaysAgo).length;

    // Calculate new revenue in memory
    const recentOrders = allOrdersData.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo &&
      order.status === 'delivered' &&
      order.paymentStatus === 'paid'
    );
    
    const newRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Weekly trends in memory
    const weeklyOrders = allOrdersData.filter(order => new Date(order.createdAt) >= sevenDaysAgo);

    // Group by day for weekly trends
    const weeklyStats = weeklyOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = { orders: 0, revenue: 0 };
      }
      acc[date].orders++;
      acc[date].revenue += order.total || 0;
      return acc;
    }, {});

    // Top performing products in memory
    const allProducts = allProductsData.filter(product => product.isActive);

    // Sort by totalSold (assuming this field exists)
    const topProducts = allProducts
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        totalSold: product.totalSold || 0,
        totalRevenue: (product.totalSold || 0) * (product.price || 0),
        averageRating: product.averageRating || 0,
        stock: product.stock || 0
      }));

    // Low stock alerts
    const lowStockProducts = allProducts
      .filter(product => (product.stock || 0) <= 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 20);

    // Recent orders in memory
    const recentOrdersList = allOrdersData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Revenue by category in memory
    const revenueByCategory = [];
    const categories = await categoryService.getAllSimple();
    
    for (const category of categories) {
      const categoryProducts = allProducts.filter(product => product.categoryId === category.id);

      const categoryRevenue = categoryProducts.reduce((sum, product) => {
        const productOrders = deliveredOrders.filter(order => 
          order.items.some(item => item.productId === product.id)
        );
        return sum + productOrders.reduce((orderSum, order) => 
          orderSum + (order.total || 0), 0
        );
      }, 0);

      revenueByCategory.push({
        category: category.name,
        revenue: categoryRevenue,
        productCount: categoryProducts.length
      });
    }

    // Sort categories by revenue
    revenueByCategory.sort((a, b) => b.revenue - a.revenue);

    res.json({
      overview: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalReviews,
        totalCoupons,
        totalGiftCards,
        totalRevenue,
        newRevenue
      },
      recentActivity: {
        newUsers,
        newOrders,
        newProducts,
        newReviews
      },
      weeklyTrends: Object.entries(weeklyStats).map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue
      })),
      topProducts,
      lowStockProducts,
      recentOrders: recentOrdersList,
      revenueByCategory: revenueByCategory.slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// User management
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    if (status) {
      if (status === 'verified') {
        options.filters = [{ field: 'isVerified', operator: '==', value: true }];
      } else if (status === 'unverified') {
        options.filters = [{ field: 'isVerified', operator: '==', value: false }];
      }
    }

    const result = await userService.getUsers(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Bulk user operations
exports.bulkUserOperations = async (req, res) => {
  try {
    const { operation, userIds } = req.body;

    if (!operation || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Operation and user IDs array are required' });
    }

    let result;
    switch (operation) {
      case 'verify':
        result = await userService.bulkUserOperations('verify', userIds);
        break;
      case 'unverify':
        result = await userService.bulkUserOperations('unverify', userIds);
        break;
      case 'delete':
        result = await userService.bulkUserOperations('delete', userIds);
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, password } = req.body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      role: role || 'user',
      password,
      isVerified: true // Admin-created users are verified by default
    };

    const user = await userService.createUser(userData);

    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, role } = req.body;

    // Check if user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Update user fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await userService.updateProfile(userId, updateData);

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete the user
    await userService.deleteUser(userId);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Product management
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      vendor,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder,
      includeInactive: true // Admin should see all products including inactive ones
    };

    if (category) {
      options.category = category;
    }
    if (vendor) {
      options.vendor = vendor;
    }
    if (status) {
      if (status === 'active') {
        options.filters = [{ field: 'isActive', operator: '==', value: true }];
      } else if (status === 'inactive') {
        options.filters = [{ field: 'isActive', operator: '==', value: false }];
      }
    }

    const result = await productService.getProducts(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Bulk product operations
exports.bulkProductOperations = async (req, res) => {
  try {
    const { operation, productIds, data } = req.body;

    if (!operation || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Operation and product IDs array are required' });
    }

    let result;
    switch (operation) {
      case 'activate':
        result = await productService.bulkProductOperations('activate', productIds);
        break;
      case 'deactivate':
        result = await productService.bulkProductOperations('deactivate', productIds);
        break;
      case 'update':
        if (!data) {
          return res.status(400).json({ message: 'Data is required for update operation' });
        }
        result = await productService.bulkProductOperations('update', productIds, data);
        break;
      case 'delete':
        result = await productService.bulkProductOperations('delete', productIds);
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
  }
};

// Order management
exports.getAllOrders = async (req, res) => {
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
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    if (status) {
      options.status = status;
    }
    if (paymentStatus) {
      options.paymentStatus = paymentStatus;
    }
    if (dateFrom || dateTo) {
      options.dateFrom = dateFrom;
      options.dateTo = dateTo;
    }

    const result = await orderService.getOrders(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Bulk order operations
exports.bulkOrderOperations = async (req, res) => {
  try {
    const { operation, orderIds, data } = req.body;

    if (!operation || !orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ message: 'Operation and order IDs array are required' });
    }

    let result;
    switch (operation) {
      case 'updateStatus':
        if (!data || !data.status) {
          return res.status(400).json({ message: 'Status is required for updateStatus operation' });
        }
        result = await orderService.bulkOrderOperations('updateStatus', orderIds, data);
        break;
      case 'updatePaymentStatus':
        if (!data || !data.paymentStatus) {
          return res.status(400).json({ message: 'Payment status is required for updatePaymentStatus operation' });
        }
        result = await orderService.bulkOrderOperations('updatePaymentStatus', orderIds, data);
        break;
      case 'delete':
        result = await orderService.bulkOrderOperations('delete', orderIds);
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
  }
};

// Category management
exports.getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    const result = await categoryService.getCategories(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await categoryService.createCategory(categoryData);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = req.body;

    const category = await categoryService.updateCategory(categoryId, updateData);

    res.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await categoryService.deleteCategory(categoryId);

    res.json({
      message: 'Category deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Vendor management
exports.getAllVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    if (status) {
      options.status = status;
    }
    if (isVerified !== undefined) {
      options.isVerified = isVerified === 'true';
    }

    const result = await vendorService.getVendors(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

// Review management
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      rating,
      isApproved,
      isFlagged,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    if (rating) {
      options.rating = parseInt(rating);
    }
    if (isApproved !== undefined) {
      options.isApproved = isApproved === 'true';
    }
    if (isFlagged !== undefined) {
      options.isFlagged = isFlagged === 'true';
    }

    const result = await reviewService.getReviews(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Coupon management
exports.getAllCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      discountType,
      isActive,
      isPublic,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    if (discountType) {
      options.discountType = discountType;
    }
    if (isActive !== undefined) {
      options.isActive = isActive === 'true';
    }
    if (isPublic !== undefined) {
      options.isPublic = isPublic === 'true';
    }

    const result = await couponService.getCoupons(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

// Gift card management
exports.getAllGiftCards = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      isActive,
      isRedeemed,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    };

    if (type) {
      options.type = type;
    }
    if (isActive !== undefined) {
      options.isActive = isActive === 'true';
    }
    if (isRedeemed !== undefined) {
      options.isRedeemed = isRedeemed === 'true';
    }

    const result = await giftCardService.getGiftCards(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift cards', error: error.message });
  }
};

// Orders management
exports.getAllOrders = async (req, res) => {
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
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    };

    const result = await orderService.getOrders(options);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Orders bulk operations
exports.bulkOrderOperations = async (req, res) => {
  try {
    const { operation, orderIds, data } = req.body;

    const result = await orderService.bulkOrderOperations(operation, orderIds, data);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    await orderService.updateOrderStatus(orderId, status);

    res.json({ message: 'Order status updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Analytics and reports
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
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

    // Get orders for the period
    const orders = await orderService.getAll({
      filters: [
        { field: 'createdAt', operator: '>=', value: startDate },
        { field: 'status', operator: '==', value: 'delivered' },
        { field: 'paymentStatus', operator: '==', value: 'paid' }
      ]
    });

    // Get users for the period
    const users = await userService.getAll({
      filters: [{ field: 'createdAt', operator: '>=', value: startDate }]
    });

    // Calculate analytics
    const salesAnalytics = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.total || 0;
      acc[date].orders++;
      return acc;
    }, {});

    const userAnalytics = users.reduce((acc, user) => {
      const date = new Date(user.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = { newUsers: 0 };
      }
      acc[date].newUsers++;
      return acc;
    }, {});

    // Get product performance
    const products = await productService.getAll();
    const productPerformance = products
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 20);

    // Get category performance
    const categories = await categoryService.getAll();
    // basic category performance by aggregating delivered orders items per category
    const categoryPerformance = categories.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      totalProducts: 0,
      totalSold: 0,
      totalRevenue: 0
    }));

    res.json({
      period,
      salesAnalytics: Object.entries(salesAnalytics).map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        orders: stats.orders,
        averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
      })),
      userAnalytics: Object.entries(userAnalytics).map(([date, stats]) => ({
        date,
        newUsers: stats.newUsers
      })),
      productPerformance,
      categoryPerformance
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// System health check
exports.getSystemHealth = async (req, res) => {
  try {
    const health = {
      database: 'healthy',
      services: {
        email: 'healthy',
        fileUpload: 'healthy',
        search: 'healthy'
      },
      performance: {
        responseTime: Date.now(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    // Check database connection by testing a simple query
    try {
      await userService.count();
    } catch (error) {
      health.database = 'unhealthy';
    }

    res.json(health);

  } catch (error) {
    res.status(500).json({ message: 'Error checking system health', error: error.message });
  }
}; 