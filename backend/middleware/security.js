const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const geoip = require('geoip-lite');
const User = require('../models/User');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Auth endpoints rate limiter (more strict)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again later.'
);

// Search endpoints rate limiter
const searchLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  30, // 30 requests per window
  'Too many search requests, please try again later.'
);

// File upload rate limiter
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later.'
);

// Admin endpoints rate limiter
const adminLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 requests per window
  'Too many admin requests, please try again later.'
);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
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

// IP blocking middleware
const ipBlocklist = new Set();
const ipWhitelist = new Set();

const ipBlockingMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  if (ipBlocklist.has(clientIP)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Allow whitelisted IPs
  if (ipWhitelist.has(clientIP)) {
    return next();
  }
  
  // Check for suspicious patterns
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !req.path.startsWith('/api/health')) {
    // Log suspicious activity
    console.warn(`Suspicious request from ${clientIP}: ${userAgent}`);
  }
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const method = req.method;
  const url = req.url;
  
  // Get location info
  const geo = geoip.lookup(clientIP);
  const location = geo ? `${geo.country}, ${geo.region}` : 'Unknown';
  
  // Log request
  console.log(`${new Date().toISOString()} | ${method} ${url} | IP: ${clientIP} | Location: ${location} | UA: ${userAgent}`);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`${new Date().toISOString()} | ${method} ${url} | Status: ${status} | Duration: ${duration}ms`);
  });
  
  next();
};

// API key validation middleware
const apiKeyValidation = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(); // Continue without API key
  }
  
  // Validate API key format (you can implement your own validation logic)
  const validApiKey = process.env.API_KEY;
  
  if (apiKey !== validApiKey) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  
  next();
};

// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({ message: 'Request entity too large' });
  }
  
  next();
};

// SQL injection protection middleware
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(\b(UNION|SELECT)\b.*\bFROM\b)/i,
    /(\b(DROP|CREATE|ALTER)\b.*\bTABLE\b)/i,
    /(\b(EXEC|EXECUTE)\b)/i,
    /(\b(SCRIPT|JAVASCRIPT)\b)/i
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj) => {
    for (const key in obj) {
      if (checkValue(obj[key])) {
        return true;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Check query parameters
  if (checkObject(req.query)) {
    return res.status(400).json({ message: 'Invalid request parameters' });
  }
  
  // Check body parameters
  if (checkObject(req.body)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }
  
  // Check URL parameters
  if (checkObject(req.params)) {
    return res.status(400).json({ message: 'Invalid URL parameters' });
  }
  
  next();
};

// XSS protection middleware
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];
  
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return xssPatterns.reduce((sanitized, pattern) => {
        return sanitized.replace(pattern, '');
      }, value);
    }
    return value;
  };
  
  const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeValue(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  };
  
  // Sanitize query parameters
  req.query = sanitizeObject(req.query);
  
  // Sanitize body parameters
  req.body = sanitizeObject(req.body);
  
  // Sanitize URL parameters
  req.params = sanitizeObject(req.params);
  
  next();
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Export all security middleware
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
  
  // Utility functions
  blockIP: (ip) => ipBlocklist.add(ip),
  unblockIP: (ip) => ipBlocklist.delete(ip),
  whitelistIP: (ip) => ipWhitelist.add(ip),
  removeFromWhitelist: (ip) => ipWhitelist.delete(ip),
  getBlockedIPs: () => Array.from(ipBlocklist),
  getWhitelistedIPs: () => Array.from(ipWhitelist)
}; 