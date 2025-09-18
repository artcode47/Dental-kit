const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const unifiedStore = require('../services/unifiedStore');

// Enhanced JWT configuration
const JWT_CONFIG = {
  algorithm: process.env.JWT_ALGORITHM || 'HS256',
  issuer: process.env.JWT_ISSUER || 'dental-kit-store',
  audience: process.env.JWT_AUDIENCE || 'dental-kit-users',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Generate JWT token with enhanced security
function generateJWT(payload, options = {}) {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(16).toString('hex') // Unique token ID
  };

  const tokenOptions = {
    algorithm: JWT_CONFIG.algorithm,
    expiresIn: options.expiresIn || JWT_CONFIG.expiresIn,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, tokenOptions);
}

// Generate refresh token with enhanced security
function generateRefreshToken(userId) {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const tokenId = crypto.randomBytes(16).toString('hex');
  
  // Store refresh token in memory store with user association
  setImmediate(async () => {
    try {
      if (unifiedStore.isConnected) {
        await unifiedStore.setCache(`refresh_token:${tokenId}`, {
          userId,
          token: refreshToken,
          createdAt: Date.now(),
          expiresAt: Date.now() + (parseInt(JWT_CONFIG.refreshExpiresIn.replace('d', '')) * 24 * 60 * 60 * 1000)
        }, parseInt(JWT_CONFIG.refreshExpiresIn.replace('d', '')) * 24 * 60 * 60);
      }
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  });

  return { refreshToken, tokenId };
}

// Generate random token with enhanced entropy
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Verify JWT token with enhanced validation
async function verifyJWT(token, options = {}) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: [process.env.JWT_ALGORITHM || 'HS256'],
      ...options
    });

    // Check if token is blacklisted (in-house store placeholder)
    if (options.checkBlacklist !== false) {
      // TODO: integrate with unifiedStore blacklist lookup if needed
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Refresh JWT token with rotation
async function refreshJWT(refreshToken, tokenId) {
  try {
    if (!unifiedStore.isConnected) {
      throw new Error('Memory store service not available');
    }

    // Get refresh token from memory store
    const storedToken = await unifiedStore.getCache(`refresh_token:${tokenId}`);
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Verify refresh token
    if (storedToken.token !== refreshToken) {
      throw new Error('Refresh token mismatch');
    }

    // Check if token is expired
    if (storedToken.expiresAt < Date.now()) {
      await unifiedStore.deleteCache(`refresh_token:${tokenId}`);
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const newAccessToken = generateJWT({ id: storedToken.userId });
    
    // Generate new refresh token (rotation)
    const newRefreshToken = generateRefreshToken(storedToken.userId);
    
    // Delete old refresh token
    await unifiedStore.deleteCache(`refresh_token:${tokenId}`);
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.refreshToken,
      tokenId: newRefreshToken.tokenId
    };
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

// Blacklist JWT token
async function blacklistToken(token, reason = 'logout') {
  try {
    if (!unifiedStore.isConnected) {
      return false;
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.jti) {
      return false;
    }

    // Store blacklisted token in memory store
    const blacklistData = {
      token: token,
      reason: reason,
      blacklistedAt: Date.now(),
      expiresAt: decoded.exp * 1000 // Convert to milliseconds
    };

    await unifiedStore.setCache(`blacklist:${decoded.jti}`, blacklistData, 
      Math.ceil((decoded.exp * 1000 - Date.now()) / 1000)
    );

    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
}

// Check if token is blacklisted
async function isTokenBlacklisted(token) {
  try {
    if (!unifiedStore.isConnected) {
      return false;
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.jti) {
      return false;
    }

    const blacklisted = await unifiedStore.getCache(`blacklist:${decoded.jti}`);
    return !!blacklisted;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
}

// Generate secure password reset token
function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
  
  return { token, expiresAt };
}

// Generate secure email verification token
function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  return { token, expiresAt };
}

// Generate secure MFA backup codes
function generateMFABackupCodes(count = 5) {
  return Array.from({ length: count }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// Generate secure session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate token format
function validateTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if it looks like a JWT token (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Check if parts are base64 encoded
  try {
    parts.forEach(part => {
      if (part) {
        Buffer.from(part, 'base64');
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Clean up expired tokens
async function cleanupExpiredTokens() {
  try {
    if (!unifiedStore.isConnected) {
      return false;
    }

    // Memory store handles TTL automatically, but we can add custom cleanup logic here
    console.log('Token cleanup completed');
    return true;
  } catch (error) {
    console.error('Token cleanup error:', error);
    return false;
  }
}

// Run cleanup every hour
setInterval(async () => {
  try {
    await cleanupExpiredTokens();
  } catch (error) {
    console.error('Token cleanup interval error:', error);
  }
}, 60 * 60 * 1000);

module.exports = {
  generateJWT,
  generateRefreshToken,
  generateRandomToken,
  verifyJWT,
  refreshJWT,
  blacklistToken,
  isTokenBlacklisted,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateMFABackupCodes,
  generateSessionId,
  validateTokenFormat,
  cleanupExpiredTokens,
  JWT_CONFIG
}; 