const UserService = require('../services/userService');
const OrderService = require('../services/orderService');
const ReviewService = require('../services/reviewService');
const WishlistService = require('../services/wishlistService');

const userService = new UserService();
const orderService = new OrderService();
const reviewService = new ReviewService();
const wishlistService = new WishlistService();

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getById(req.user.id);
    
    // Remove sensitive fields
    const { password, refreshTokens, verificationToken, resetPasswordToken, resetPasswordExpires, mfaSecret, mfaEmailOTP, ...safeUser } = user;
    
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      company,
      university,
      country,
      governorate,
      timezone,
      language,
      dateOfBirth,
      gender
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (university !== undefined) updateData.university = university;
    if (country !== undefined) updateData.country = country;
    if (governorate !== undefined) updateData.governorate = governorate;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;

    const user = await userService.update(req.user.id, updateData);

    // Remove sensitive fields
    const { password, refreshTokens, verificationToken, resetPasswordToken, resetPasswordExpires, mfaSecret, mfaEmailOTP, ...safeUser } = user;

    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await userService.getById(req.user.id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

// Add address
exports.addAddress = async (req, res) => {
  try {
    const {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      phone,
      isDefault
    } = req.body;

    const addressData = {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      phone,
      isDefault: isDefault || false
    };

    const user = await userService.getById(req.user.id);
    const addresses = user.addresses || [];

    // If this is the first address or isDefault is true, make it default
    if (addresses.length === 0 || isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
      addressData.isDefault = true;
    }

    addresses.push(addressData);
    await userService.update(req.user.id, { addresses });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;

    const user = await userService.getById(req.user.id);
    const addresses = user.addresses || [];

    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If making this address default, unset others
    if (updateData.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    addresses[addressIndex] = { ...addresses[addressIndex], ...updateData };
    await userService.update(req.user.id, { addresses });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await userService.getById(req.user.id);
    const addresses = user.addresses || [];

    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    addresses.splice(addressIndex, 1);
    await userService.update(req.user.id, { addresses });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences, emailPreferences } = req.body;

    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (emailPreferences) updateData.emailPreferences = emailPreferences;

    const user = await userService.update(req.user.id, updateData);

    // Remove sensitive fields
    const { password, refreshTokens, verificationToken, resetPasswordToken, resetPasswordExpires, mfaSecret, mfaEmailOTP, ...safeUser } = user;

    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// Get user orders
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    };

    const result = await orderService.getUserOrders(req.user.id, options);

    res.json({
      orders: result.orders,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getById(orderId);
    
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getById(orderId);
    
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    const updatedOrder = await orderService.update(orderId, { status: 'cancelled' });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

// Get user reviews
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Simple query without complex sorting to avoid composite indexes
    const querySnapshot = await reviewService.collectionRef
      .where('userId', '==', req.user.id)
      .get();
    
    const reviews = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const convertedData = reviewService.convertTimestamps(data);
      reviews.push({
        id: doc.id,
        ...convertedData
      });
    });

    // Sort in memory (more efficient than composite indexes)
    reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Apply pagination
    const total = reviews.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Get user wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.getOrCreateWishlist(req.user.id);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get orders count and total spent using simplified query
    const allOrders = await orderService.getAllSimple();
    const userOrders = allOrders.filter(order => order.userId === userId);
    
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get wishlist count
    const wishlist = await wishlistService.getOrCreateWishlist(userId);
    const wishlistCount = wishlist.items ? wishlist.items.length : 0;
    
    // Get reviews count using simplified query
    const allReviews = await reviewService.getAllSimple();
    const userReviews = allReviews.filter(review => review.userId === userId);
    const reviewsCount = userReviews.length;
    
    res.json({
      totalOrders,
      totalSpent,
      wishlistCount,
      reviewsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get user activity
exports.getActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get recent orders using simplified query
    const allOrders = await orderService.getAllSimple();
    const userOrders = allOrders.filter(order => order.userId === userId);
    const recentOrders = userOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    // Get recent reviews using simplified query
    const allReviews = await reviewService.getAllSimple();
    const userReviews = allReviews.filter(review => review.userId === userId);
    const recentReviews = userReviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    // Combine and sort activities
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        action: `Order #${order.orderNumber} placed`,
        timestamp: order.createdAt,
        data: order
      })),
      ...recentReviews.map(review => ({
        type: 'review',
        action: `Review posted for ${review.productName || 'product'}`,
        timestamp: review.createdAt,
        data: review
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
    
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
}; 