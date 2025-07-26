const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const router = express.Router();

/**
 * @route   POST /api/it-auth/login
 * @desc    IT Admin login
 * @access  Public
 */
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: req.__('auth.invalid_credentials')
      });
    }

    // Check if user is IT admin
    if (user.role !== 'it_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. IT admin privileges required.'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Account not verified. Please verify your email first.'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        status: 'error',
        message: 'Account locked. Try again later.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      
      await user.save();
      
      return res.status(401).json({
        status: 'error',
        message: req.__('auth.invalid_credentials')
      });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Add refresh token to user's tokens
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Log successful IT login
    console.log(`[${new Date().toISOString()}] [INFO] IT Admin login successful: ${user.email}`);

    res.json({
      status: 'success',
      message: 'IT Admin login successful',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        },
        token,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('IT Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: req.__('auth.server_error')
    });
  }
});

/**
 * @route   POST /api/it-auth/refresh
 * @desc    Refresh IT admin token
 * @access  Public
 */
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], validate, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Check if user is IT admin
    if (user.role !== 'it_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. IT admin privileges required.'
      });
    }

    // Check if refresh token exists in user's tokens
    if (!user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Token Refresh Error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }
});

/**
 * @route   POST /api/it-auth/logout
 * @desc    IT Admin logout
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from user's tokens
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    }

    // Log IT logout
    console.log(`[${new Date().toISOString()}] [INFO] IT Admin logout: ${req.user.email}`);

    res.json({
      status: 'success',
      message: 'IT Admin logged out successfully'
    });

  } catch (error) {
    console.error('IT Logout Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout'
    });
  }
});

/**
 * @route   GET /api/it-auth/verify
 * @desc    Verify IT admin token
 * @access  Private
 */
router.get('/verify', async (req, res) => {
  try {
    // Check if user is IT admin
    if (req.user.role !== 'it_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. IT admin privileges required.'
      });
    }

    res.json({
      status: 'success',
      message: 'IT Admin token verified',
      data: {
        user: {
          _id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          isVerified: req.user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Token Verification Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying token'
    });
  }
});

module.exports = router; 