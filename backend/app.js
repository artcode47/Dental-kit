const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const i18n = require('i18n');

// Import services and middleware
const unifiedStore = require('./services/unifiedStore');
const { 
  performanceMonitoring, 
  cachePerformanceMonitoring, 
  memoryMonitoring,
  requestSizeMonitoring,
  compressionMonitoring,
  databaseConnectionMonitoring,
  cleanupPerformanceMonitoring
} = require('./middleware/performance');
const securityMiddleware = require('./middleware/security');
const authMiddleware = require('./middleware/auth');
const csrfMiddleware = require('./middleware/csrf');
const languageMiddleware = require('./middleware/language');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const giftCardRoutes = require('./routes/giftCards');
const vendorRoutes = require('./routes/vendors');
const comparisonRoutes = require('./routes/comparisons');
const adminRoutes = require('./routes/admin');
const itRoutes = require('./routes/it');
const ogRoutes = require('./routes/og');
const itAuthRoutes = require('./routes/it-auth');
const languageRoutes = require('./routes/language');

const app = express();

// Enhanced environment variable validation
const requiredEnvVars = [
  'JWT_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Warning for development JWT secret
if (process.env.NODE_ENV === 'development' && process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  console.warn('⚠️  WARNING: Using default JWT secret in development. Change this in production!');
}

// Initialize unifiedStore (built-in memory store)
let storeInitialized = false;
let storeHealth = false;

const initializeStore = async () => {
  try {
    await unifiedStore.connect();
    storeInitialized = true;
    storeHealth = await unifiedStore.healthCheck();
    console.log('✅ Built-in memory store initialized successfully');
    
    // Pre-warm cache with common data
    await preWarmCache();
    
  } catch (error) {
    console.error('❌ Failed to initialize built-in memory store:', error);
    storeInitialized = false;
    storeHealth = false;
    
    // In production, exit if store fails to initialize
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Critical: Store initialization failed in production. Exiting...');
      process.exit(1);
    }
  }
};

// Pre-warm cache with common data
const preWarmCache = async () => {
  try {
    // Cache common configuration
    await unifiedStore.setCache('app:config', {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        caching: true,
        performance: true,
        notifications: true,
        security: true
      }
    }, 3600); // 1 hour
    
    console.log('✅ Cache pre-warmed successfully');
  } catch (error) {
    console.warn('⚠️  Cache pre-warming failed:', error.message);
  }
};

// Initialize store on startup
initializeStore();

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://dental-kit-store.vercel.app',
      'https://dental-kit-store.netlify.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-CSRF-Token', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

// Enhanced compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Performance monitoring middleware (apply early)
app.use(performanceMonitoring);
app.use(cachePerformanceMonitoring);
app.use(memoryMonitoring);
app.use(requestSizeMonitoring);
app.use(compressionMonitoring);
app.use(databaseConnectionMonitoring);

// Security middleware
app.use(securityMiddleware.ipBlockingMiddleware);
app.use(securityMiddleware.requestLogger);
app.use(securityMiddleware.requestSizeLimit);
app.use(securityMiddleware.xssProtection);
app.use(securityMiddleware.sessionSecurity);
app.use(securityMiddleware.userActivityTracking);
app.use(securityMiddleware.securityMonitoring);

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'dental-kit-cookie-secret'));

// i18n configuration and middleware
i18n.configure({
  locales: ['en', 'ar', 'fr', 'es'],
  defaultLocale: 'en',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  autoReload: false,
  updateFiles: false,
  syncFiles: false,
  cookie: 'locale',
  api: { __: '__', __n: '__n' }
});
app.use(i18n.init);

// Language middleware
app.use(languageMiddleware.languageDetection);
app.use(languageMiddleware.rtlSupport);

// CSRF token issuance on all requests (sets X-CSRF-Token header)
app.use(csrfMiddleware.generateAndSendCSRFToken);

// CSRF protection for non-GET requests
app.use(csrfMiddleware.csrfProtection);

// Static files with caching headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Health check endpoints
app.get('/api/health', async (req, res) => {
  try {
    const storeHealth = storeInitialized ? await unifiedStore.healthCheck() : false;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      store: {
        initialized: storeInitialized,
        health: storeHealth
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    // Check if store is healthy
    if (!storeHealth) {
      healthStatus.status = 'degraded';
      healthStatus.store.health = false;
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint to show environment variables
app.get('/test-env', (req, res) => {
  const firebaseVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_PRIVATE_KEY_ID', 
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_CLIENT_ID'
  ];
  
  const envStatus = {};
  firebaseVars.forEach(varName => {
    envStatus[varName] = process.env[varName] ? 'SET' : 'NOT SET';
  });
  
  res.json({
    environment: process.env.NODE_ENV,
    firebaseVars: envStatus,
    allFirebaseVars: Object.keys(process.env).filter(key => key.startsWith('FIREBASE'))
  });
});

// Performance metrics endpoint
app.get('/api/performance', async (req, res) => {
  try {
    const { performanceService } = require('./middleware/performance');
    const metrics = performanceService.getPerformanceMetrics();
    const health = performanceService.getHealthStatus();
    const recommendations = performanceService.getPerformanceRecommendations();
    
    res.json({
      success: true,
      data: {
        metrics,
        health,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving performance metrics',
      error: error.message
    });
  }
});

// API routes with performance monitoring
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', authMiddleware, wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/it', itRoutes);
app.use('/api/it-auth', itAuthRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/og', ogRoutes);

// Enhanced centralized error handler
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id || 'anonymous',
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Log error to unifiedStore for authenticated users
  if (req.user && storeInitialized) {
    unifiedStore.trackUserActivity(req.user.id, {
      action: 'error',
      details: {
        message: error.message,
        url: req.url,
        method: req.method,
        timestamp: new Date()
      }
    }).catch(err => console.warn('Failed to log error to store:', err));
  }

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  const errorMessage = isProduction ? 'Internal server error' : error.message;
  const errorDetails = isProduction ? {} : { stack: error.stack };

  res.status(error.status || 500).json({
    success: false,
    message: errorMessage,
    ...errorDetails
  });
});

// 404 handler (Express 5 catch-all)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Cleanup performance monitoring
    cleanupPerformanceMonitoring();
    
    // Disconnect unifiedStore
    if (storeInitialized) {
      await unifiedStore.disconnect();
      console.log('✅ Store disconnected successfully');
    }
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: reason,
    promise: promise
  });
  
  // In production, exit the process
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Unhandled promise rejection in production. Exiting...');
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  
  // In production, exit the process
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Uncaught exception in production. Exiting...');
    process.exit(1);
  }
});

// Memory leak detection
setInterval(() => {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  
  // Warning if memory usage is high
  if (heapUsedMB > 512) { // 512MB
    console.warn(`⚠️  High memory usage: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB`);
  }
  
  // Critical if memory usage is very high
  if (heapUsedMB > 1024) { // 1GB
    console.error(`🚨 Critical memory usage: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB`);
  }
}, 60000); // Check every minute

// Export app for testing
module.exports = app; 