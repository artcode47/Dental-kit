const UserService = require('../services/userService');
const sendEmail = require('../utils/email');
const { 
  generateJWT, 
  generateRandomToken, 
  generateRefreshToken,
  refreshJWT,
  blacklistToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateSessionId
} = require('../utils/token');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const auditLog = require('../utils/auditLogger');
const i18n = require('i18n');
const jwt = require('jsonwebtoken');
const unifiedStore = require('../services/unifiedStore');

const userService = new UserService();

function logActivity(userId, action, details = '') {
  const logLine = `${new Date().toISOString()} | User: ${userId} | Action: ${action} | ${details}\n`;
  fs.appendFileSync(path.join(__dirname, '../logs/activity.log'), logLine);
}

function getSessionId() {
  return generateSessionId();
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Consent management
exports.giveConsent = async (req, res) => {
  const user = req.user;
  await userService.update(user.id, {
    consentGiven: true,
    consentTimestamp: new Date()
  });
  res.json({ message: 'Consent given' });
};

exports.revokeConsent = async (req, res) => {
  const user = req.user;
  await userService.update(user.id, { consentGiven: false });
  res.json({ message: 'Consent revoked' });
};

// Data export and anonymization
exports.exportData = async (req, res) => {
  const user = req.user;
  const data = { ...user };
  delete data.password;
  delete data.verificationToken;
  delete data.resetPasswordToken;
  delete data.resetPasswordExpires;
  res.json({ data });
};

exports.anonymizeAccount = async (req, res) => {
  const user = req.user;
  await userService.update(user.id, {
    email: `anonymized_${user.id}@example.com`,
    password: 'anonymized',
    anonymized: true,
    isVerified: false,
    securityQuestions: [],
    // mfa fields removed from system; no-op if present
    mfaSecret: undefined,
    mfaBackupCodes: [],
    sessions: []
  });
  res.json({ message: 'Account anonymized' });
};

// Enhanced token refresh endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken, tokenId } = req.body;
    
    if (!refreshToken || !tokenId) {
      return res.status(400).json({ 
        message: 'Refresh token and token ID are required',
        error: 'MISSING_REFRESH_TOKEN'
      });
    }
    
    // Use enhanced refresh token system
    const refreshResult = await refreshJWT(refreshToken, tokenId);
    
    // Set CSRF token in response headers
    const { generateCSRFToken } = require('../middleware/csrf');
    const csrfToken = generateCSRFToken();
    
    // Store CSRF token for this user session
    const userId = jwt.decode(refreshResult.accessToken).id;
    const sessionId = userId.toString();
    
    if (unifiedStore.isConnected) {
      await unifiedStore.setCSRFToken(sessionId, csrfToken);
    }
    
    res.setHeader('X-CSRF-Token', csrfToken);
    
    res.json({ 
      accessToken: refreshResult.accessToken,
      refreshToken: refreshResult.refreshToken,
      tokenId: refreshResult.tokenId,
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      message: 'Token refresh failed',
      error: 'REFRESH_FAILED'
    });
  }
};

// Enhanced registration
exports.register = async (req, res) => {
  const { 
    email, 
    password, 
    firstName,
    lastName,
    phone,
    company,
    university,
    country,
    governorate,
    consentGiven, 
    language 
  } = req.body;
  
  // Debug logging
  console.log('Registration data received:', {
    email,
    firstName,
    lastName,
    phone,
    company,
    university,
    country,
    governorate,
    consentGiven,
    language
  });
  
  try {
    if (!consentGiven) return res.status(400).json({ message: req.__('auth.consent_required') });
    
    // Check if user already exists using Firebase service
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: req.__('auth.email_already_registered') });
    
    // Generate enhanced verification token
    const verificationData = generateEmailVerificationToken();
    
    const userData = { 
      email, 
      password, 
      firstName,
      lastName,
      phone,
      company,
      university,
      country,
      governorate,
      consentGiven: true, 
      consentTimestamp: new Date(), 
      language: language || 'en',
      verificationToken: verificationData.token,
      verificationTokenExpires: new Date(verificationData.expiresAt)
    };
    
    // Debug logging
    console.log('Creating user with data:', userData);
    
    // Create user using Firebase service
    const user = await userService.createUser(userData);
    
    // Firebase Auth handles email verification automatically
    console.log('User created successfully with Firebase Auth email verification');
    
    // Track registration activity
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity('system', {
        action: 'user_registered',
        details: { email, userId: user.id, timestamp: new Date().toISOString() }
      });
    }
    
    res.status(201).json({ message: req.__('auth.registration_successful') });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: req.__('auth.server_error') });
  }
};

// Enhanced email verification
exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await userService.getUserByEmail(email);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // If user is already verified, return success
    if (user.isVerified) {
      return res.json({ message: 'Email already verified successfully' });
    }
    
    // For Firebase Auth, we'll just mark as verified
    // In production, you'd verify the token with Firebase
    try {
      await userService.verifyEmailToken(email, token);
      
      // Track verification activity
      if (unifiedStore.isConnected) {
        await unifiedStore.trackUserActivity(user.id, {
          action: 'email_verified',
          details: { email, timestamp: new Date().toISOString() }
        });
      }
      
      res.json({ message: 'Email verified successfully' });
    } catch (verificationError) {
      console.error('Token verification error:', verificationError);
      
      // Check if the error is specifically about token expiration
      if (verificationError.message.includes('expired')) {
        res.status(400).json({ 
          message: 'Verification token has expired',
          errorType: 'TOKEN_EXPIRED',
          email: email
        });
      } else if (verificationError.message.includes('Invalid')) {
        res.status(400).json({ 
          message: 'Invalid verification token',
          errorType: 'INVALID_TOKEN'
        });
      } else {
        res.status(400).json({ 
          message: 'Verification failed',
          errorType: 'VERIFICATION_FAILED'
        });
      }
    }
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enhanced resend verification
exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(200).json({ message: 'If that email is registered, a verification email has been sent.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Use our email system to resend verification
    try {
      await userService.resendVerificationEmail(email);
      
      // Track resend activity
      if (unifiedStore.isConnected) {
        await unifiedStore.trackUserActivity('system', {
          action: 'verification_resent',
          details: { email, timestamp: new Date().toISOString() }
        });
      }
      
      res.json({ message: 'If that email is registered, a verification email has been sent.' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Error sending verification email' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Enhanced login
exports.login = async (req, res) => {
  console.log('Login attempt:', { email: req.body.email, path: req.path });
  const { email, password } = req.body;
  
  try {
    // Use Firebase UserService for authentication
    const user = await userService.authenticateUser(email, password);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
    
    // Check if user is locked (simplified for now)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account locked. Try again later.' });
    }

    // Enhanced login with refresh token rotation
    const accessToken = generateJWT({ id: user.id });
    const refreshTokenData = generateRefreshToken(user.id);
    
    // Generate CSRF token
    const { generateCSRFToken } = require('../middleware/csrf');
    const csrfToken = generateCSRFToken();
    
    // Store CSRF token for this user session
    const sessionId = user.id.toString();
    if (unifiedStore.isConnected) {
      await unifiedStore.setCSRFToken(sessionId, csrfToken);
    }
    
    console.log(`CSRF token stored for user ${sessionId}:`, csrfToken.substring(0, 10) + '...');
    
    // Return user information along with access token
    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || []
    };
    
    // Set CSRF token in response headers
    res.setHeader('X-CSRF-Token', csrfToken);
    
    // Track successful login
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity(user.id, {
        action: 'login_successful',
        details: { 
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.json({ 
      accessToken,
      refreshToken: refreshTokenData.refreshToken,
      tokenId: refreshTokenData.tokenId,
      user: userInfo
    });
  } catch (err) {
    console.error('Login error:', err);
    
    // Track failed login
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity('system', {
        action: 'login_failed',
        details: { 
          email,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Enhanced session management
exports.listSessions = async (req, res) => {
  const user = req.user;
  
  try {
    // Get sessions from memory store if available
    let sessions = [];
    if (unifiedStore.isConnected) {
      const userSessions = await unifiedStore.getCache(`user_sessions:${user.id}`) || [];
      sessions = userSessions;
    } else {
      // Fallback to user model sessions
      sessions = user.sessions || [];
    }
    
    res.json({ 
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        userAgent: s.userAgent,
        ip: s.ip,
        createdAt: s.createdAt,
        lastUsed: s.lastUsed,
        isRevoked: s.isRevoked,
      })) 
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ message: 'Error retrieving sessions' });
  }
};

exports.revokeSession = async (req, res) => {
  const { sessionId } = req.params;
  const user = req.user;
  
  try {
    if (unifiedStore.isConnected) {
      // Revoke session in memory store
      await unifiedStore.deleteCache(`user_sessions:${user.id}:${sessionId}`);
    } else {
      // Fallback to user model sessions
      if (user.sessions) {
        const session = user.sessions.find(s => s.sessionId === sessionId);
        if (session) {
          session.isRevoked = true;
          await userService.update(user.id, { sessions: user.sessions });
        }
      }
    }
    
    res.json({ message: 'Session revoked' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Error revoking session' });
  }
};

// Enhanced logout
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Blacklist the token
      if (unifiedStore.isConnected) {
        await blacklistToken(token, 'logout');
      }
    }
    
    // Clear any stored refresh tokens for this user
    if (req.user?.id && unifiedStore.isConnected) {
      // This would require additional logic to track refresh tokens per user
      // For now, we'll just clear the CSRF token
      await unifiedStore.deleteCSRFToken(req.user.id.toString());
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enhanced password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    
    // Use Firebase Auth password reset
    try {
      await userService.resetPassword(email);
      
      // Track password reset request
      if (unifiedStore.isConnected) {
        await unifiedStore.trackUserActivity('system', {
          action: 'password_reset_requested',
          details: { email, timestamp: new Date().toISOString() }
        });
      }
      
      res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (resetError) {
      console.error('Password reset error:', resetError);
      res.status(500).json({ message: 'Error sending password reset email' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    
    // Check if reset token matches and is not expired
    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Update password and clear reset token
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await userService.update(user.id, { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      // Track password reset
      if (unifiedStore.isConnected) {
        await unifiedStore.trackUserActivity(user.id, {
          action: 'password_reset_completed',
          details: { timestamp: new Date().toISOString() }
        });
      }
      
      res.json({ message: 'Password reset successful' });
    } catch (updateError) {
      console.error('Password update error:', updateError);
      res.status(500).json({ message: 'Error updating password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Enhanced security questions
exports.setSecurityQuestions = async (req, res) => {
  const user = req.user;
  const { questions } = req.body; // [{question, answer}]
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Questions required' });
  }
  
  const securityQuestions = await Promise.all(questions.map(async q => ({
    question: q.question,
    answerHash: await bcrypt.hash(q.answer, 10),
  })));
  
  await userService.update(user.id, { securityQuestions });
  
  // Track security questions setup
  if (unifiedStore.isConnected) {
    await unifiedStore.trackUserActivity(user.id, {
      action: 'security_questions_set',
      details: { timestamp: new Date().toISOString() }
    });
  }
  
  res.json({ message: 'Security questions set' });
};

exports.verifySecurityQuestions = async (req, res) => {
  const { email, answers } = req.body; // [{question, answer}]
  const user = await userService.getUserByEmail(email);
  if (!user || !user.securityQuestions || user.securityQuestions.length === 0) {
    return res.status(400).json({ message: 'No security questions set' });
  }
  
  let allCorrect = true;
  for (let i = 0; i < user.securityQuestions.length; i++) {
    const q = user.securityQuestions[i];
    const provided = answers.find(a => a.question === q.question);
    if (!provided || !(await bcrypt.compare(provided.answer, q.answerHash))) {
      allCorrect = false;
      break;
    }
  }
  
  if (!allCorrect) return res.status(400).json({ message: 'Incorrect answers' });
  
  // Allow password reset or send recovery token here
  res.json({ message: 'Security answers verified. You may reset your password.' });
};

// Enhanced email preferences
exports.getEmailPreferences = async (req, res) => {
  const user = req.user;
  res.json({ emailPreferences: user.emailPreferences });
};

exports.updateEmailPreferences = async (req, res) => {
  const user = req.user;
  const { marketing, security, updates } = req.body;
  
  const emailPreferences = { ...user.emailPreferences };
  if (typeof marketing === 'boolean') emailPreferences.marketing = marketing;
  if (typeof security === 'boolean') emailPreferences.security = security;
  if (typeof updates === 'boolean') emailPreferences.updates = updates;
  
  await userService.update(user.id, { emailPreferences });
  
  // Track preferences update
  if (unifiedStore.isConnected) {
    await unifiedStore.trackUserActivity(user.id, {
      action: 'email_preferences_updated',
      details: { preferences: emailPreferences, timestamp: new Date().toISOString() }
    });
  }
  
  res.json({ emailPreferences });
};

// Enhanced language preferences
exports.getLanguage = async (req, res) => {
  const user = req.user;
  res.json({ language: user.language });
};

exports.setLanguage = async (req, res) => {
  const user = req.user;
  const { language } = req.body;
  
  await userService.update(user.id, { language });
  
  // Track language change
  if (unifiedStore.isConnected) {
    await unifiedStore.trackUserActivity(user.id, {
      action: 'language_changed',
      details: { language, timestamp: new Date().toISOString() }
    });
  }
  
  res.json({ language });
}; 

// Enhanced profile methods
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      company: user.company || '',
      university: user.university || '',
      country: user.country || 'EG',
      governorate: user.governorate || '',
      timezone: user.timezone || 'EET',
      language: user.language || 'en',
      role: user.role || 'user',
      permissions: user.permissions || [],
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
    
    res.json({ profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const updateFields = ['firstName', 'lastName', 'phone', 'company', 'university', 'country', 'governorate', 'timezone', 'language', 'notificationPreferences'];
    
    const updateData = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const updatedUser = await userService.updateProfile(user.id, updateData);
    
    // Track profile update
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity(user.id, {
        action: 'profile_updated',
        details: { fields: Object.keys(updateData), timestamp: new Date().toISOString() }
      });
    }
    
    res.json({ message: 'Profile updated successfully', profile: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const user = req.user;
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Here you would typically upload to cloud storage (Cloudinary, AWS S3, etc.)
    // For now, we'll just store the file path
    await userService.update(user.id, { profileImage: req.file.path });
    
    // Track profile image upload
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity(user.id, {
        action: 'profile_image_uploaded',
        details: { imagePath: req.file.path, timestamp: new Date().toISOString() }
      });
    }
    
    res.json({ message: 'Profile image uploaded successfully', profileImage: req.file.path });
  } catch (err) {
    console.error('Upload profile image error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    const { password } = req.body;
    
    // Verify password before deletion using Firebase service
    try {
      await userService.authenticateUser(user.email, password);
    } catch (authError) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    
    // Delete the user using Firebase service
    await userService.deleteUser(user.id);
    
    // Track account deletion
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity('system', {
        action: 'account_deleted',
        details: { userId: user.id, email: user.email, timestamp: new Date().toISOString() }
      });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test endpoint to mark user as verified (for development only)
exports.markAsVerified = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    await userService.markUserAsVerified(email);
    
    // Track manual verification
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity('system', {
        action: 'user_manually_verified',
        details: { email, timestamp: new Date().toISOString() }
      });
    }
    
    res.json({ message: 'User marked as verified successfully' });
  } catch (err) {
    console.error('Mark as verified error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test endpoint to test email functionality
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Test email sending
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    const testToken = 'test-token-123';
    const verifyUrl = `${CLIENT_URL}/verify-email?token=${testToken}&email=${email}`;
    
    await sendEmail({
      to: email,
      subject: 'Test Email - Dental Kit Store',
      template: 'verify-email',
      context: { 
        email, 
        verifyUrl, 
        year: new Date().getFullYear(),
        firstName: 'Test'
      },
    });
    
    // Track test email
    if (unifiedStore.isConnected) {
      await unifiedStore.trackUserActivity('system', {
        action: 'test_email_sent',
        details: { email, timestamp: new Date().toISOString() }
      });
    }
    
    res.json({ message: 'Test email sent successfully' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ message: 'Email test failed', error: err.message });
  }
}; 
