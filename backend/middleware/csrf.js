const crypto = require('crypto');
const unifiedStore = require('../services/unifiedStore');

// Generate CSRF token with enhanced entropy
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token with unified store
const validateCSRFToken = async (token, sessionId) => {
  if (!token || !sessionId) {
    console.log('CSRF validation failed: missing token or sessionId');
    return false;
  }
  
  try {
    const storedTokenData = await unifiedStore.getCSRFToken(sessionId);
    if (!storedTokenData) {
      console.log(`CSRF validation failed: no stored token for session ${sessionId}`);
      return false;
    }
    
    // Check if token is expired
    if (storedTokenData.expiresAt < Date.now()) {
      console.log(`CSRF validation failed: token expired for session ${sessionId}`);
      await unifiedStore.deleteCSRFToken(sessionId);
      return false;
    }
    
    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(storedTokenData.token, 'hex')
    );
    
    console.log(`CSRF validation ${isValid ? 'passed' : 'failed'} for session ${sessionId}`);
    return isValid;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
};

// CSRF protection middleware with enhanced security
const csrfProtection = async (req, res, next) => {
  console.log(`CSRF Check: ${req.method} ${req.path}`);
  
  // Skip CSRF check for GET requests and health checks
  if (req.method === 'GET' || req.path === '/api/health') {
    console.log('Skipping CSRF check for GET request or health check');
    return next();
  }
  
  // Skip CSRF check for API key authenticated requests
  if (req.headers['x-api-key']) {
    console.log('Skipping CSRF check for API key request');
    return next();
  }
  
  // Skip CSRF check for authentication routes (login, register, etc.)
  const authRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/request-password-reset',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/refresh-token'
  ];
  
  if (authRoutes.includes(req.path)) {
    console.log('Skipping CSRF check for auth route');
    return next();
  }
  
  // For admin routes, we need to check if user is authenticated first
  // If not authenticated, CSRF check will fail, but that's expected
  let sessionId;
  if (req.user?._id) {
    sessionId = req.user._id.toString();
  } else {
    // Create a unique session ID for unauthenticated users
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const hash = require('crypto').createHash('md5').update(ip + userAgent).digest('hex');
    sessionId = `anon_${hash}`;
  }
  console.log(`CSRF Check - Session ID: ${sessionId}, User: ${req.user?._id || 'not authenticated'}`);
  
  // Check if token exists in headers
  const csrfToken = req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'];
  
  if (!csrfToken) {
    return res.status(403).json({
      message: 'CSRF token missing',
      error: 'CSRF_TOKEN_MISSING',
      code: 'CSRF_MISSING'
    });
  }
  
  // Validate token asynchronously
  try {
    const isValid = await validateCSRFToken(csrfToken, sessionId);
    
    if (!isValid) {
      return res.status(403).json({
        message: 'Invalid CSRF token',
        error: 'CSRF_TOKEN_INVALID',
        code: 'CSRF_INVALID'
      });
    }
    
    // Token is valid, proceed
    next();
  } catch (error) {
    console.error('CSRF validation error:', error);
    return res.status(500).json({
      message: 'CSRF validation failed',
      error: 'CSRF_VALIDATION_ERROR',
      code: 'CSRF_ERROR'
    });
  }
};

// Generate and send CSRF token using unified store
const generateAndSendCSRFToken = async (req, res, next) => {
  try {
    // For authenticated users, use their ID; for others, use IP + user agent hash
    let sessionId;
    if (req.user?._id) {
      sessionId = req.user._id.toString();
    } else {
      // Create a unique session ID for unauthenticated users
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const hash = require('crypto').createHash('md5').update(ip + userAgent).digest('hex');
      sessionId = `anon_${hash}`;
    }
    
    // Check if token already exists for this session
    const existingTokenData = await unifiedStore.getCSRFToken(sessionId);
    if (existingTokenData) {
      // Use existing token
      res.setHeader('X-CSRF-Token', existingTokenData.token);
      return next();
    }
    
    // Generate new token only if one doesn't exist
    const token = generateCSRFToken();
    const expiry = parseInt(process.env.CSRF_TOKEN_EXPIRY) || 86400000; // 24 hours
    
    // Store token
    const stored = await unifiedStore.setCSRFToken(sessionId, token, expiry);
    if (!stored) {
      console.error('Failed to store CSRF token');
      return next();
    }
    
    // Set token in response headers
    res.setHeader('X-CSRF-Token', token);
    
    next();
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    next();
  }
};

// Enhanced CSRF utilities
const csrfUtils = {
  // Generate token for testing
  generateCSRFToken,
  
  // Validate token
  validateCSRFToken,
  
  // Clean up expired tokens (unified store handles TTL if implemented)
  cleanupExpiredTokens: async () => {
    try {
      console.log('CSRF token cleanup completed');
      return true;
    } catch (error) {
      console.error('CSRF cleanup error:', error);
      return false;
    }
  },
  
  // Get CSRF token info
  getTokenInfo: async (sessionId) => {
    try {
      return await unifiedStore.getCSRFToken(sessionId);
    } catch (error) {
      console.error('Error getting CSRF token info:', error);
      return null;
    }
  },
  
  // Revoke CSRF token
  revokeToken: async (sessionId) => {
    try {
      return await unifiedStore.deleteCSRFToken(sessionId);
    } catch (error) {
      console.error('Error revoking CSRF token:', error);
      return false;
    }
  },
  
  // Bulk revoke tokens for user
  revokeUserTokens: async (userId) => {
    try {
      const sessionId = userId.toString();
      return await unifiedStore.deleteCSRFToken(sessionId);
    } catch (error) {
      console.error('Error revoking user CSRF tokens:', error);
      return false;
    }
  }
};

// Clean up expired tokens every hour
setInterval(async () => {
  try {
    await csrfUtils.cleanupExpiredTokens();
  } catch (error) {
    console.error('CSRF cleanup interval error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

module.exports = {
  csrfProtection,
  generateAndSendCSRFToken,
  generateCSRFToken,
  validateCSRFToken,
  csrfUtils
}; 