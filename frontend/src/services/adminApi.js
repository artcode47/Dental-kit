import api from './api';

// Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

// User Management
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const bulkUserOperations = async (operation, userIds) => {
  try {
    const response = await api.post('/admin/users/bulk', { operation, userIds });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform bulk user operation');
  }
};

// Product Management
export const getAllProducts = async (params = {}) => {
  try {
    const response = await api.get('/admin/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

export const bulkProductOperations = async (operation, productIds, data = null) => {
  try {
    const payload = { operation, productIds };
    if (data) payload.data = data;
    
    const response = await api.post('/admin/products/bulk', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform bulk product operation');
  }
};

// Order Management
export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const bulkOrderOperations = async (operation, orderIds, data = null) => {
  try {
    const payload = { operation, orderIds };
    if (data) payload.data = data;
    
    const response = await api.post('/admin/orders/bulk', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform bulk order operation');
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  try {
    const response = await api.patch(`/admin/orders/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order payment status');
  }
};

// Analytics and Reports
export const getAnalytics = async (period = '30d') => {
  try {
    const response = await api.get('/admin/analytics', { params: { period } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
  }
};

// System Health
export const getSystemHealth = async () => {
  try {
    const response = await api.get('/admin/health');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system health');
  }
};

// Category Management
export const getAllCategories = async (params = {}) => {
  try {
    const response = await api.get('/categories', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

// Vendor Management
export const getAllVendors = async (params = {}) => {
  try {
    const response = await api.get('/vendors', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
  }
};

export const getVendor = async (vendorId) => {
  try {
    const response = await api.get(`/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch vendor');
  }
};

export const createVendor = async (vendorData) => {
  try {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create vendor');
  }
};

export const updateVendor = async (vendorId, vendorData) => {
  try {
    const response = await api.put(`/vendors/${vendorId}`, vendorData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update vendor');
  }
};

export const deleteVendor = async (vendorId) => {
  try {
    const response = await api.delete(`/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete vendor');
  }
};

export const toggleVendorStatus = async (vendorId) => {
  try {
    const response = await api.patch(`/vendors/${vendorId}/toggle`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle vendor status');
  }
};

export const verifyVendor = async (vendorId) => {
  try {
    const response = await api.patch(`/vendors/${vendorId}/verify`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to verify vendor');
  }
};

export const bulkVendorOperations = async (operation, vendorIds, data = null) => {
  try {
    const payload = { operation, vendorIds };
    if (data) payload.data = data;
    
    const response = await api.post('/vendors/bulk', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform bulk vendor operation');
  }
};

// Review Management
export const getAllReviews = async (params = {}) => {
  try {
    const response = await api.get('/reviews', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
  }
};

// Coupon Management
export const getAllCoupons = async (params = {}) => {
  try {
    const response = await api.get('/coupons/admin/all', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await api.post('/coupons/admin/create', couponData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create coupon');
  }
};

export const updateCoupon = async (couponId, couponData) => {
  try {
    const response = await api.put(`/coupons/admin/${couponId}`, couponData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update coupon');
  }
};

export const deleteCoupon = async (couponId) => {
  try {
    const response = await api.delete(`/coupons/admin/${couponId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete coupon');
  }
};

export const toggleCouponStatus = async (couponId) => {
  try {
    const response = await api.patch(`/coupons/admin/${couponId}/toggle`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle coupon status');
  }
};

export const getCouponStats = async (params = {}) => {
  try {
    const response = await api.get('/coupons/admin/stats', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch coupon stats');
  }
};

export const generateCouponCode = async (params = {}) => {
  try {
    const response = await api.post('/coupons/admin/generate-code', params);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate coupon code');
  }
};

// Gift Card Management
export const getAllGiftCards = async (params = {}) => {
  try {
    const response = await api.get('/gift-cards/admin/all', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch gift cards');
  }
};

export const getGiftCardStats = async () => {
  try {
    const response = await api.get('/gift-cards/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch gift card stats');
  }
};

// Mock data for development/testing
export const getMockDashboardStats = () => {
  return {
    overview: {
      totalUsers: 1247,
      totalProducts: 856,
      totalOrders: 2341,
      totalRevenue: 125430,
      totalCategories: 24,
      totalVendors: 67,
      totalReviews: 1892,
      totalCoupons: 45,
      totalGiftCards: 23
    },
    recentActivity: {
      newUsers: 89,
      newOrders: 156,
      newRevenue: 12450,
      newProducts: 34,
      newReviews: 67
    },
    weeklyTrends: [
      { day: 'Mon', orders: 45, revenue: 2340 },
      { day: 'Tue', orders: 52, revenue: 2890 },
      { day: 'Wed', orders: 48, revenue: 2560 },
      { day: 'Thu', orders: 61, revenue: 3240 },
      { day: 'Fri', orders: 67, revenue: 3560 },
      { day: 'Sat', orders: 73, revenue: 3890 },
      { day: 'Sun', orders: 58, revenue: 3120 }
    ],
    topProducts: [
      { name: 'Dental Floss Premium', sold: 234, revenue: 4680 },
      { name: 'Electric Toothbrush Pro', sold: 189, revenue: 7560 },
      { name: 'Mouthwash Fresh', sold: 156, revenue: 2340 },
      { name: 'Toothpaste Whitening', sold: 145, revenue: 1160 },
      { name: 'Dental Mirror Set', sold: 123, revenue: 615 }
    ],
    lowStockProducts: [
      { name: 'Dental Scaler', stock: 3, price: 45 },
      { name: 'Gum Stimulator', stock: 5, price: 12 },
      { name: 'Tongue Cleaner', stock: 7, price: 8 },
      { name: 'Dental Wax', stock: 8, price: 15 },
      { name: 'Orthodontic Pliers', stock: 9, price: 89 }
    ],
    recentOrders: [
      { id: '#ORD-001', customer: 'John Doe', amount: 234, status: 'delivered' },
      { id: '#ORD-002', customer: 'Jane Smith', amount: 156, status: 'processing' },
      { id: '#ORD-003', customer: 'Mike Johnson', amount: 89, status: 'pending' },
      { id: '#ORD-004', customer: 'Sarah Wilson', amount: 445, status: 'shipped' },
      { id: '#ORD-005', customer: 'Tom Brown', amount: 123, status: 'delivered' }
    ],
    revenueByCategory: [
      { category: 'Oral Care', revenue: 45600, orders: 234 },
      { category: 'Dental Tools', revenue: 34500, orders: 156 },
      { category: 'Orthodontics', revenue: 28900, orders: 89 },
      { category: 'Preventive Care', revenue: 23400, orders: 123 },
      { category: 'Professional Tools', revenue: 18900, orders: 67 }
    ]
  };
};

export const getMockRecentActivity = () => {
  return [
    {
      type: 'user',
      title: 'New user registered',
      description: 'John Doe created a new account',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      type: 'order',
      title: 'New order placed',
      description: 'Order #ORD-001 for $234.00',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      type: 'review',
      title: 'New product review',
      description: '5-star review for Dental Floss Premium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      type: 'alert',
      title: 'Low stock alert',
      description: 'Dental Scaler is running low (3 items left)',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      type: 'success',
      title: 'Payment processed',
      description: 'Payment for order #ORD-002 completed',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];
};

export default {
  getDashboardStats,
  getAllUsers,
  bulkUserOperations,
  getAllProducts,
  bulkProductOperations,
  getAllOrders,
  getAnalytics,
  getSystemHealth,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllVendors,
  getAllReviews,
  getAllCoupons,
  getAllGiftCards,
  getMockDashboardStats,
  getMockRecentActivity
}; 