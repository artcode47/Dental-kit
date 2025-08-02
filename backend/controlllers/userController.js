const User = require('../models/User');
const Order = require('../models/Order');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshTokens -verificationToken -resetPasswordToken -resetPasswordExpires -mfaSecret -mfaEmailOTP');
    
    res.json(user);
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

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken -resetPasswordExpires -mfaSecret -mfaEmailOTP');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json(user.addresses);
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

    const user = await User.findById(req.user._id);
    
    // If this is the first address or isDefault is true, set it as default
    if (user.addresses.length === 0 || isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
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

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update address fields
    if (type !== undefined) address.type = type;
    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (company !== undefined) address.company = company;
    if (address1 !== undefined) address.address1 = address1;
    if (address2 !== undefined) address.address2 = address2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (country !== undefined) address.country = country;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (phone !== undefined) address.phone = phone;

    // Handle default address
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If deleting default address, set first remaining address as default
    if (address.isDefault && user.addresses.length > 1) {
      const remainingAddresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
      if (remainingAddresses.length > 0) {
        remainingAddresses[0].isDefault = true;
      }
    }

    user.addresses.pull(addressId);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses.forEach(addr => addr.isDefault = false);
    address.isDefault = true;
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error setting default address', error: error.message });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences emailPreferences');
    res.json({
      preferences: user.preferences,
      emailPreferences: user.emailPreferences
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preferences', error: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences, emailPreferences } = req.body;

    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (emailPreferences) updateData.emailPreferences = emailPreferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('preferences emailPreferences');

    res.json({
      preferences: user.preferences,
      emailPreferences: user.emailPreferences
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// Get user order history
exports.getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name images sku')
      .populate('items.vendor', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history', error: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate('items.product', 'name images sku description')
      .populate('items.vendor', 'name logo');

    if (!order) {
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
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.adminNotes = reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalOrders totalSpent lastOrderDate');
    
    const stats = {
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastOrderDate: user.lastOrderDate,
      averageOrderValue: user.totalOrders > 0 ? user.totalSpent / user.totalOrders : 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
}; 