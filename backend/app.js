const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const {
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
  sessionSecurity
} = require('./middleware/security');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const giftCardRoutes = require('./routes/giftCards');
const comparisonRoutes = require('./routes/comparisons');
const adminRoutes = require('./routes/admin');
const languageRoutes = require('./routes/language');
const itRoutes = require('./routes/it');
const itAuthRoutes = require('./routes/it-auth');
const i18n = require('i18n');
const { languageDetection, rtlSupport } = require('./middleware/language');
const { requestMonitor, systemMonitor, performanceMonitor, errorMonitor } = require('./middleware/monitoring');
require('dotenv').config();

const app = express();

i18n.configure({
  locales: ['en', 'ar', 'fr', 'es'],
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  objectNotation: true,
  autoReload: true,
  updateFiles: false,
});

// Apply security middleware
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(ipBlockingMiddleware);
app.use(requestLogger);
app.use(apiKeyValidation);
app.use(requestSizeLimit);
app.use(sqlInjectionProtection);
app.use(xssProtection);
app.use(sessionSecurity);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);
app.use(languageDetection);
app.use(rtlSupport);

// Apply monitoring middleware
app.use(requestMonitor);
app.use(systemMonitor);
app.use(performanceMonitor);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/products/search', searchLimiter);
app.use('/api/products/upload-images', uploadLimiter);
app.use('/api/admin', adminLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/it', itRoutes);
app.use('/api/it-auth', itAuthRoutes);

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root health check endpoint for Fly.io
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// IT Dashboard route
app.get('/it-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'it-dashboard.html'));
});

// Apply error monitoring
app.use(errorMonitor);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; 