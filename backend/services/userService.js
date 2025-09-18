const FirebaseService = require('./firebaseService');
const bcrypt = require('bcryptjs');
const { auth } = require('../config/firebase');
const { generateRandomToken } = require('../utils/token');
const sendEmail = require('../utils/email');

class UserService extends FirebaseService {
  constructor() {
    super('users');
  }

  // Create a new user with Firebase Auth and Firestore (optimized)
  async createUser(userData) {
    try {
      // Hash password first (this is fast)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Generate verification token
      const verificationToken = generateRandomToken();

      // Create Firebase Auth user (this is the slow part)
      console.log('Creating Firebase Auth user...');
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      });
      console.log('Firebase Auth user created successfully');

      // Prepare user data for Firestore
      const userDoc = {
        firebaseUid: userRecord.uid,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        company: userData.company || '',
        university: userData.university || '',
        country: userData.country || 'EG',
        governorate: userData.governorate || '',
        timezone: userData.timezone || 'EET',
        language: userData.language || 'en',
        dateOfBirth: userData.dateOfBirth || null,
        gender: userData.gender || null,
        profileImage: userData.profileImage || '',
        notificationPreferences: {
          email: true,
          sms: false,
          promotional: true
        },
        emailPreferences: {
          marketing: true,
          security: true,
          updates: true
        },
        addresses: userData.addresses || [],
        preferences: {
          newsletter: true,
          marketing: true,
          orderUpdates: true,
          productRecommendations: true
        },
        totalOrders: 0,
        totalSpent: 0,
        recentlyViewed: [],
        searchHistory: [],
        loyaltyPoints: 0,
        loyaltyTier: 'bronze',
        referralCode: this.generateReferralCode(),
        referralCount: 0,
        referralEarnings: 0,
        role: userData.role || 'user',
        permissions: userData.permissions || [],
        isActive: true,
        isVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        failedLoginAttempts: 0,
        lockUntil: null,
        sessions: [],
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        consentGiven: userData.consentGiven || false,
        consentTimestamp: userData.consentTimestamp || new Date(),
        anonymized: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create Firestore document (this is fast)
      console.log('Creating Firestore document...');
      const createdUser = await this.create(userDoc);
      console.log('Firestore document created successfully');

      // Send email verification using our email system
      setImmediate(async () => {
        try {
          console.log('Sending email verification...');
          const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
          const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}&email=${userData.email}`;
          
          await sendEmail({
            to: userData.email,
            subject: 'Verify Your Email - Dental Kit Store',
            template: 'verify-email',
            context: { 
              email: userData.email, 
              verifyUrl, 
              year: new Date().getFullYear(),
              firstName: userData.firstName || 'User'
            },
          });
          console.log('Email verification sent successfully');
        } catch (emailError) {
          console.error('Email verification error:', emailError);
          // Continue even if email fails
        }
      });

      return {
        id: createdUser.id,
        firebaseUid: userRecord.uid,
        ...userDoc
      };
    } catch (error) {
      console.error('User creation error:', error);
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Authenticate user (optimized for speed)
  async authenticateUser(email, password) {
    try {
      // Get user data from Firestore (this is fast)
      const user = await this.findOneBy('email', email);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Account is temporarily locked');
      }

      // Verify password (this is fast)
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // Increment failed login attempts
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 minutes
        
        // Update failed attempts asynchronously
        setImmediate(async () => {
          try {
            await this.update(user.id, { 
              failedLoginAttempts: failedAttempts,
              lockUntil: lockUntil
            });
          } catch (updateError) {
            console.error('Failed to update login attempts:', updateError);
          }
        });
        
        throw new Error('Invalid password');
      }

      // Reset failed login attempts on successful login (asynchronously)
      setImmediate(async () => {
        try {
          await this.update(user.id, { 
            lastLogin: new Date(),
            failedLoginAttempts: 0,
            lockUntil: null
          });
        } catch (updateError) {
          console.error('Failed to update last login:', updateError);
        }
      });

      return {
        id: user.id,
        firebaseUid: user.firebaseUid,
        ...user
      };
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  // Update user profile (optimized)
  async updateProfile(userId, profileData) {
    try {
      const user = await this.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update Firebase Auth profile asynchronously if name is provided
      if (profileData.firstName || profileData.lastName) {
        setImmediate(async () => {
          try {
            await auth.updateUser(user.firebaseUid, {
              displayName: `${profileData.firstName || user.firstName} ${profileData.lastName || user.lastName}`.trim()
            });
          } catch (authError) {
            console.error('Firebase Auth update error:', authError);
            // Continue even if Firebase Auth fails
          }
        });
      }

      // Update Firestore document (this is fast)
      const updatedUser = await this.update(userId, {
        ...profileData,
        updatedAt: new Date()
      });
      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  }

  // Reset password using Firebase Auth (optimized)
  async resetPassword(email) {
    try {
      // Generate reset token
      const resetToken = generateRandomToken();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      const user = await this.getUserByEmail(email);
      if (user) {
        await this.update(user.id, {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires
        });

        // Send password reset email using our email system
        setImmediate(async () => {
          try {
            const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
            const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
            
            await sendEmail({
              to: email,
              subject: 'Password Reset - Dental Kit Store',
              template: 'reset-password',
              context: { 
                email, 
                resetUrl, 
                year: new Date().getFullYear(),
                firstName: user.firstName || 'User'
              },
            });
            console.log('Password reset email sent successfully');
          } catch (resetError) {
            console.error('Password reset error:', resetError);
          }
        });
      }
      
      return { message: 'Password reset email sent' };
    } catch (error) {
      throw new Error(`Error sending password reset email: ${error.message}`);
    }
  }

  // Change password (optimized)
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in Firebase Auth asynchronously
      setImmediate(async () => {
        try {
          await auth.updateUser(user.firebaseUid, {
            password: newPassword
          });
        } catch (authError) {
          console.error('Firebase Auth password update error:', authError);
        }
      });

      // Update password in Firestore (this is fast)
      await this.update(userId, { 
        password: hashedPassword,
        updatedAt: new Date()
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  // Delete user (optimized)
  async deleteUser(userId) {
    try {
      const user = await this.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete from Firestore first (this is fast)
      await this.delete(userId);

      // Delete from Firebase Auth asynchronously
      if (user.firebaseUid) {
        setImmediate(async () => {
          try {
            await auth.deleteUser(user.firebaseUid);
          } catch (authError) {
            console.error('Firebase Auth delete error:', authError);
          }
        });
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Get user by email (this is already fast)
  async getUserByEmail(email) {
    try {
      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let user = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email === email) {
          user = {
            id: doc.id,
            ...this.convertTimestamps(data)
          };
        }
      });

      return user;
    } catch (error) {
      throw new Error(`Error getting user by email: ${error.message}`);
    }
  }

  // Update user statistics (optimized)
  async updateUserStats(userId, stats) {
    try {
      const user = await this.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedStats = {
        totalOrders: (user.totalOrders || 0) + (stats.totalOrders || 0),
        totalSpent: (user.totalSpent || 0) + (stats.totalSpent || 0),
        lastOrderDate: stats.lastOrderDate || user.lastOrderDate,
        updatedAt: new Date()
      };

      await this.update(userId, updatedStats);
      return updatedStats;
    } catch (error) {
      throw new Error(`Error updating user stats: ${error.message}`);
    }
  }

  // Add to recently viewed products (optimized)
  async addRecentlyViewed(userId, productId) {
    try {
      const user = await this.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const recentlyViewed = user.recentlyViewed || [];
      
      // Remove if already exists
      const filtered = recentlyViewed.filter(item => item.product !== productId);
      
      // Add to beginning
      filtered.unshift({
        product: productId,
        viewedAt: new Date()
      });

      // Keep only last 20 items
      const updated = filtered.slice(0, 20);

      await this.update(userId, { 
        recentlyViewed: updated,
        updatedAt: new Date()
      });
      return updated;
    } catch (error) {
      throw new Error(`Error adding recently viewed: ${error.message}`);
    }
  }

  // Add to search history (optimized)
  async addSearchHistory(userId, query) {
    try {
      const user = await this.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const searchHistory = user.searchHistory || [];
      
      // Remove if already exists
      const filtered = searchHistory.filter(item => item.query !== query);
      
      // Add to beginning
      filtered.unshift({
        query,
        timestamp: new Date()
      });

      // Keep only last 50 items
      const updated = filtered.slice(0, 50);

      await this.update(userId, { 
        searchHistory: updated,
        updatedAt: new Date()
      });
      return updated;
    } catch (error) {
      throw new Error(`Error adding search history: ${error.message}`);
    }
  }

  // Generate referral code (this is fast)
  generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Get full name (this is fast)
  getFullName(user) {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || '';
  }

  // Get user by Firestore document ID
  async getUserById(id) {
    return await this.getById(id);
  }

  // Verify email token (updated to use our token system)
  async verifyEmailToken(email, token) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is already verified
      if (user.isVerified) {
        return user;
      }

      // Check if token matches and is not expired
      if (user.verificationToken !== token) {
        throw new Error('Invalid verification token');
      }

      if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
        throw new Error('Verification token has expired');
      }

      // Mark user as verified
      await this.update(user.id, {
        isVerified: true,
        emailVerifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
        updatedAt: new Date()
      });

      return user;
    } catch (error) {
      throw new Error(`Email verification error: ${error.message}`);
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User is already verified');
      }

      // Generate new verification token
      const verificationToken = generateRandomToken();
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token
      await this.update(user.id, {
        verificationToken: verificationToken,
        verificationTokenExpires: verificationTokenExpires,
        updatedAt: new Date()
      });

      // Send new verification email
      const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
      const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}&email=${email}`;
      
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - Dental Kit Store',
        template: 'verify-email',
        context: { 
          email, 
          verifyUrl, 
          year: new Date().getFullYear(),
          firstName: user.firstName || 'User'
        },
      });

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      throw new Error(`Error sending verification email: ${error.message}`);
    }
  }

  // Mark user as verified for testing purposes
  async markUserAsVerified(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      await this.update(user.id, {
        isVerified: true,
        emailVerifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
        updatedAt: new Date()
      });

      return user;
    } catch (error) {
      throw new Error(`Error marking user as verified: ${error.message}`);
    }
  }

  // Get users with filtering, sorting, and pagination
  async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let users = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        users.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user => 
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      // Sort in memory
      users.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Calculate pagination
      const total = users.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      };
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }

  // Bulk user operations
  async bulkUserOperations(operation, userIds) {
    try {
      if (!operation || !userIds || !Array.isArray(userIds)) {
        throw new Error('Operation and user IDs array are required');
      }

      const updates = userIds.map(id => ({ id, data: {} }));

      switch (operation) {
        case 'verify':
          updates.forEach(update => {
            update.data.isVerified = true;
            update.data.updatedAt = new Date();
          });
          break;
        case 'unverify':
          updates.forEach(update => {
            update.data.isVerified = false;
            update.data.updatedAt = new Date();
          });
          break;
        case 'delete':
          await this.batchDelete(userIds);
          return { message: `Bulk operation '${operation}' completed successfully` };
        default:
          throw new Error('Invalid operation');
      }

      await this.batchUpdate(updates);
      return { message: `Bulk operation '${operation}' completed successfully` };
    } catch (error) {
      throw new Error(`Error performing bulk user operations: ${error.message}`);
    }
  }
}

module.exports = UserService;
