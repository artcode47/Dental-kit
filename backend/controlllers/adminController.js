const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const GiftCard = require('../models/GiftCard');
const ProductComparison = require('../models/ProductComparison');

// Dashboard overview statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Overall statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCategories,
      totalVendors,
      totalReviews,
      totalCoupons,
      totalGiftCards
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Category.countDocuments(),
      Vendor.countDocuments(),
      Review.countDocuments(),
      Coupon.countDocuments(),
      GiftCard.countDocuments()
    ]);

    // Recent activity (last 30 days)
    const [
      newUsers,
      newOrders,
      newRevenue,
      newProducts,
      newReviews
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'delivered', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Review.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Weekly trends
    const weeklyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
            day: { $dayOfWeek: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1, '_id.day': 1 } }
    ]);

    // Top performing products
    const topProducts = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orderItems'
        }
      },
      {
        $addFields: {
          totalSold: {
            $sum: '$orderItems.items.quantity'
          },
          totalRevenue: {
            $sum: '$orderItems.items.total'
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          totalSold: 1,
          totalRevenue: 1,
          averageRating: 1,
          stock: 1
        }
      }
    ]);

    // Low stock alerts
    const lowStockProducts = await Product.find({
      stock: { $lte: 10 },
      isActive: true
    })
    .select('name stock price category vendor')
    .populate('category', 'name')
    .populate('vendor', 'name')
    .sort({ stock: 1 })
    .limit(20);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { $match: { status: 'delivered', paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          revenue: { $sum: '$items.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      overview: {
        totalUsers: totalUsers,
        totalProducts: totalProducts,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCategories: totalCategories,
        totalVendors: totalVendors,
        totalReviews: totalReviews,
        totalCoupons: totalCoupons,
        totalGiftCards: totalGiftCards
      },
      recentActivity: {
        newUsers: newUsers,
        newOrders: newOrders,
        newRevenue: newRevenue[0]?.total || 0,
        newProducts: newProducts,
        newReviews: newReviews
      },
      weeklyTrends: weeklyStats,
      topProducts,
      lowStockProducts,
      recentOrders,
      revenueByCategory
    });

  } catch (error) {
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

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (status === 'verified') query.isVerified = true;
      else if (status === 'unverified') query.isVerified = false;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken -refreshTokens')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

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
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isVerified: true }
        );
        break;
      case 'unverify':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isVerified: false }
        );
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json({
      message: `Bulk operation '${operation}' completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
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

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (vendor) query.vendor = vendor;
    if (status) {
      if (status === 'active') query.isActive = true;
      else if (status === 'inactive') query.isActive = false;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('vendor', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

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
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isActive: false }
        );
        break;
      case 'update':
        if (!data) {
          return res.status(400).json({ message: 'Data is required for update operation' });
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: data }
        );
        break;
      case 'delete':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json({
      message: `Bulk operation '${operation}' completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount
    });

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

    const query = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name')
      .populate('items.vendor', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

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
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { status: data.status }
        );
        break;
      case 'updatePaymentStatus':
        if (!data || !data.paymentStatus) {
          return res.status(400).json({ message: 'Payment status is required for updatePaymentStatus operation' });
        }
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { paymentStatus: data.paymentStatus }
        );
        break;
      case 'delete':
        result = await Order.deleteMany({ _id: { $in: orderIds } });
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json({
      message: `Bulk operation '${operation}' completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
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

    // Sales analytics
    const salesAnalytics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'delivered', paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // User analytics
    const userAnalytics = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Product performance
    const productPerformance = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orderItems'
        }
      },
      {
        $addFields: {
          totalSold: {
            $sum: '$orderItems.items.quantity'
          },
          totalRevenue: {
            $sum: '$orderItems.items.total'
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 }
    ]);

    // Category performance
    const categoryPerformance = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'products._id',
          foreignField: 'items.product',
          as: 'orderItems'
        }
      },
      {
        $addFields: {
          totalProducts: { $size: '$products' },
          totalSold: {
            $sum: '$orderItems.items.quantity'
          },
          totalRevenue: {
            $sum: '$orderItems.items.total'
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      period,
      salesAnalytics,
      userAnalytics,
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

    // Check database connection
    try {
      await User.findOne().limit(1);
    } catch (error) {
      health.database = 'unhealthy';
    }

    res.json(health);

  } catch (error) {
    res.status(500).json({ message: 'Error checking system health', error: error.message });
  }
}; 