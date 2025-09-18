const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const geoip = require('geoip-lite');
const UserService = require('../services/userService');
const unifiedStore = require('../services/unifiedStore');

const userService = new UserService();

// Enhanced rate limiting configurations (in-house store backed)
const createRateLimiter = (windowMs, max, message, keyGenerator = null) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => {
      // Use IP address as default key
      return req.ip || req.connection.remoteAddress || 'unknown';
    }),
    handler: (req, res) => {
      res.status(429).json({
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        error: 'RATE_LIMIT_EXCEEDED'
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks and certain endpoints
      return req.path === '/api/health' || req.path === '/health';
    }
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // Increased from 100 to 200 requests per window
  'Too many requests from this IP, please try again later.'
);

// Auth endpoints rate limiter (more generous)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // Increased from 30 to 100 requests per window
  'Too many authentication attempts, please try again later.',
  (req) => {
    // Use email + IP for auth rate limiting
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `auth:${email}:${ip}`;
  }
);

// Search endpoints rate limiter
const searchLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  60, // Increased from 30 to 60 requests per window
  'Too many search requests, please try again later.',
  (req) => {
    // Use IP + user agent for search rate limiting
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `search:${ip}:${userAgent.substring(0, 50)}`;
  }
);

// File upload rate limiter
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  20, // Increased from 10 to 20 uploads per hour
  'Too many file uploads, please try again later.',
  (req) => {
    // Use user ID + IP for upload rate limiting
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `upload:${userId}:${ip}`;
  }
);

// Admin endpoints rate limiter
const adminLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // Increased from 50 to 100 requests per window
  'Too many admin requests, please try again later.',
  (req) => {
    // Use user ID for admin rate limiting
    const userId = req.user?.id || 'anonymous';
    return `admin:${userId}`;
  }
);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Accept-Language',
    'User-Agent',
    'x-device-info',
    'x-client-version',
    'x-platform',
    'x-browser',
    'x-os',
    'x-screen-resolution',
    'x-timezone',
    'x-language',
    'x-currency',
    'x-request-timestamp',
    'X-Request-Timestamp',
    'X-Device-Info',
    'X-Client-Version',
    'X-Platform',
    'X-Browser',
    'X-OS',
    'X-Screen-Resolution',
    'X-Timezone',
    'X-Language',
    'X-Currency',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-CSRF-Token'
  ]
};

// Enhanced Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
};

// Enhanced IP blocking middleware (in-house store)
const ipBlockingMiddleware = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  try {
    // Check memory store for blocked IPs
    const blockedIPs = await unifiedStore.getCache('blocked_ips') || [];
    
    if (blockedIPs.includes(clientIP)) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'IP_BLOCKED'
      });
    }
    
    // Enhanced rate limiting per IP using memory store
    const rateLimitResult = await unifiedStore.incrementRateLimit(
      `ip:${clientIP}`,
      15 * 60 * 1000, // 15 minutes
      1000 // max requests per window
    );
    
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ 
        message: 'Too many requests from this IP',
        error: 'IP_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);
    
    next();
  } catch (error) {
    console.error('IP blocking middleware error:', error);
    // Continue if store is not available
    next();
  }
};

// Enhanced request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      userRole: req.user?.role || 'anonymous'
    };
    
    console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} ${logData.status} ${logData.duration}`);
    
    // Track user activity in memory store if authenticated
    if (req.user?.id) {
      try {
        await unifiedStore.trackUserActivity(req.user.id, {
          action: `${req.method} ${req.url}`,
          status: res.statusCode,
          duration,
          ip: logData.ip,
          userAgent: logData.userAgent
        });
      } catch (error) {
        console.error('Error tracking user activity:', error);
      }
    }
  });
  
  next();
};

// Enhanced API key validation middleware
const apiKeyValidation = (req, res, next) => {
  // Temporarily disable API key validation for testing
  // TODO: Re-enable this in production
  return next();
  
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }
  
  // Validate API key (implement your validation logic here)
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  // Add test API key for development/testing
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    validApiKeys.push('test-api-key-123');
  }
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  
  next();
};

// Enhanced request size limit middleware
const requestSizeLimit = (req, res, next) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({ 
      message: 'Request too large',
      error: 'REQUEST_TOO_LARGE',
      maxSize: maxSize
    });
  }
  
  next();
};

// Enhanced SQL injection protection middleware
const sqlInjectionProtection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\b\s+\d+\s*[=<>])/i,
      /(\b(OR|AND)\b\s+['"][^'"]*['"]\s*[=<>])/i,
      /(\b(OR|AND)\b\s+\w+\s*[=<>])/i,
      /(--|\/\*|\*\/|xp_|sp_)/i,
      /(\b(WAITFOR|DELAY)\b)/i,
      /(\b(BENCHMARK|SLEEP)\b)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  const checkObject = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) return true;
      } else if (checkValue(value)) {
        return true;
      }
    }
    return false;
  };
  
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({ 
      message: 'Invalid input detected',
      error: 'SQL_INJECTION_DETECTED'
    });
  }
  
  next();
};

// Enhanced XSS protection middleware
const xssProtection = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value !== 'string') return value;
    
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };
  
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' ? sanitizeObject(item) : sanitizeValue(item)
        );
      } else {
        sanitized[key] = sanitizeValue(value);
      }
    }
    return sanitized;
  };
  
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

// Enhanced session security middleware
const sessionSecurity = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
};

// Enhanced device fingerprinting middleware
const deviceFingerprinting = (req, res, next) => {
  const deviceInfo = {
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    language: req.get('Accept-Language'),
    platform: req.get('x-platform'),
    browser: req.get('x-browser'),
    os: req.get('x-os'),
    screenResolution: req.get('x-screen-resolution'),
    timezone: req.get('x-timezone'),
    timestamp: new Date().toISOString()
  };
  
  req.deviceInfo = deviceInfo;
  next();
};

// Enhanced geographic location middleware
const geoLocation = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const geo = geoip.lookup(clientIP);
  
  req.geoLocation = geo || {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'Unknown'
  };
  
  next();
};

// Enhanced user activity tracking middleware
const userActivityTracking = async (req, res, next) => {
  if (req.user) {
    try {
      // Update user activity in memory store
      await unifiedStore.trackUserActivity(req.user.id, {
        action: `${req.method} ${req.url}`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      // Update user service asynchronously
      setImmediate(async () => {
        try {
          await userService.update(req.user.id, {
            lastActivity: new Date(),
            lastIP: req.ip || req.connection.remoteAddress,
            lastUserAgent: req.get('User-Agent')
          });
        } catch (error) {
          console.error('Error updating user activity:', error);
        }
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }
  
  next();
};

// Enhanced security monitoring
const securityMonitoring = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    // Log suspicious activities
    if (res.statusCode >= 400) {
      try {
        await unifiedStore.trackUserActivity('system', {
          action: 'security_alert',
          details: {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous',
            duration
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error logging security alert:', error);
      }
    }
  });
  
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  searchLimiter,
  uploadLimiter,
  adminLimiter,
  corsOptions,
  helmetConfig,
  ipBlockingMiddleware,
  requestLogger,
  apiKeyValidation,
  requestSizeLimit,
  sqlInjectionProtection,
  xssProtection,
  sessionSecurity,
  deviceFingerprinting,
  geoLocation,
  userActivityTracking,
  securityMonitoring
}; 