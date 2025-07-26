# Dental E-commerce Backend

A comprehensive, production-ready Node.js backend for a dental equipment e-commerce platform with advanced features including real-time communication, advanced search, gift cards, product comparison, admin dashboard, enhanced security, and comprehensive IT monitoring.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dental-website
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   PORT=5000
   NODE_ENV=development
   ```

3. **Create IT admin user**
   ```bash
   npm run create-admin
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🔧 IT Monitoring Dashboard

Access the IT monitoring dashboard: `http://localhost:5000/it-dashboard`

**Default IT Admin Credentials:**
- Email: `itadmin@dentalstore.com`
- Password: `ITAdmin123!`

## 📋 Comprehensive Feature List

### 1. 🔐 Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication
- **Refresh Tokens** - Automatic token renewal
- **Multi-Factor Authentication (MFA)** - TOTP and Email OTP
- **Role-Based Access Control** - User, Admin, IT Admin roles
- **Password Security** - Bcrypt hashing with salt rounds
- **Account Locking** - Protection against brute force attacks
- **Session Management** - Secure session handling
- **OAuth Integration** - Ready for social login

### 2. 🛍️ E-commerce Core Features
- **Product Management** - Full CRUD with categories and vendors
- **Shopping Cart** - Persistent cart with real-time updates
- **Wishlist** - User wishlist management
- **Order Management** - Complete order lifecycle
- **Review System** - Product reviews and ratings
- **Coupon System** - Discount codes and promotions
- **Gift Cards** - Digital and physical gift cards
- **Product Comparison** - Side-by-side comparison tools

### 3. 🔍 Advanced Search & Discovery
- **Natural Language Processing** - Intelligent search with stemming
- **Advanced Filtering** - Price, rating, availability, category filters
- **Search Suggestions** - Autocomplete functionality
- **Popular Searches** - Trending search analytics
- **Product Recommendations** - AI-powered suggestions
- **Search History** - User search behavior tracking
- **Relevance Scoring** - Smart product ranking algorithm
- **In-Memory Indexing** - Fast search performance

### 4. ⚡ Real-time Features (Socket.io)
- **Live Chat Support** - Customer support chat system
- **Order Status Updates** - Real-time order tracking
- **Inventory Alerts** - Low stock notifications
- **Product View Tracking** - Real-time analytics
- **Typing Indicators** - Live typing status
- **Admin Notifications** - Real-time admin updates
- **User Activity Tracking** - Live user monitoring

### 5. 🌐 Multi-language Support
- **Internationalization (i18n)** - Multiple language support
- **Arabic RTL Support** - Right-to-left layout
- **Language Detection** - Automatic language detection
- **Translation Management** - Centralized translation system
- **Dynamic Language Switching** - Runtime language changes
- **Localized Content** - Language-specific content

### 6. 🛡️ Security Features
- **Rate Limiting** - Granular rate limiting per endpoint
- **IP Blocking** - Dynamic IP blocking and whitelisting
- **SQL Injection Protection** - Comprehensive input validation
- **XSS Protection** - Cross-site scripting prevention
- **Request Logging** - Detailed request/response logging
- **API Key Validation** - Secure API access control
- **Enhanced CORS** - Configurable cross-origin resource sharing
- **Security Headers** - Comprehensive security header implementation
- **Input Sanitization** - Data sanitization and validation

### 7. 📊 Admin Dashboard & Management
- **Comprehensive Analytics** - Sales, user, and product analytics
- **Real-time Dashboard** - Live statistics and monitoring
- **User Management** - Bulk user operations and analytics
- **Product Management** - Advanced product management
- **Order Management** - Complete order lifecycle management
- **System Health Monitoring** - Performance and health checks
- **Advanced Reporting** - Customizable reports and exports
- **Bulk Operations** - Mass data operations

### 8. 🔧 IT Monitoring & System Management
- **System Health Dashboard** - Real-time system monitoring
- **Performance Metrics** - CPU, memory, network monitoring
- **Database Monitoring** - MongoDB performance tracking
- **Error Logging** - Comprehensive error tracking
- **Backup Management** - Database backup and restore
- **Real-time Metrics** - Live system statistics
- **Connection Monitoring** - Socket.io connection tracking
- **System Configuration** - Environment and config management

### 9. 📧 Email & Notifications
- **Email Templates** - Handlebars-based email templates
- **Transactional Emails** - Order confirmations, password reset
- **Marketing Emails** - Newsletter and promotional emails
- **Push Notifications** - Web push notifications
- **Email Preferences** - User email preference management
- **Email Verification** - Account verification system

### 10. 🧪 Testing & Quality Assurance
- **Comprehensive Test Suite** - Unit and integration tests
- **Socket.io Testing** - Real-time feature testing
- **Search Engine Testing** - Advanced search functionality testing
- **API Testing** - Complete endpoint testing
- **Coverage Reporting** - Code coverage analysis
- **Test Utilities** - Reusable test helpers and mocks
- **Performance Testing** - Load and stress testing

## 🛠 Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB (v6+) with Mongoose ODM (v8.16.3)
- **Real-time**: Socket.io (v4.7.4)
- **Authentication**: JWT with refresh tokens

### Security & Middleware
- **Security**: Helmet (v8.1.0), CORS (v2.8.5)
- **Rate Limiting**: express-rate-limit (v7.5.1)
- **Validation**: express-validator (v7.2.1)
- **File Upload**: Multer (v2.0.2) + Cloudinary (v2.7.0)
- **Email**: Nodemailer (v7.0.5) with Handlebars (v4.7.8)

### Advanced Features
- **Search**: Natural language processing (natural v6.10.4)
- **Push Notifications**: Web Push API (web-push v3.6.6)
- **MFA**: Speakeasy (v2.0.0) for TOTP, QR Code generation
- **Internationalization**: i18n (v0.15.1)
- **Testing**: Jest (v30.0.4) with Supertest (v7.1.3)

### Development Tools
- **Development**: Nodemon (v3.1.10)
- **HTTP Client**: Axios (v1.10.0)
- **Utilities**: bcryptjs (v3.0.2), jsonwebtoken (v9.0.2)

## 📚 API Documentation

### Authentication Endpoints

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "consentGiven": true,
  "language": "en"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=dental-tools&minPrice=10&maxPrice=100&rating=4
```

#### Advanced Search
```http
GET /api/products/search?q=dental drill&category=equipment&priceRange=50-200&rating=4&inStock=true
```

#### Get Product by ID
```http
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer admin-token
Content-Type: application/json

{
  "name": "Professional Dental Drill",
  "description": "High-quality dental drill for professional use",
  "price": 299.99,
  "category": "64f8a1b2c3d4e5f6a7b8c9d0",
  "vendor": "64f8a1b2c3d4e5f6a7b8c9d0",
  "stock": 50,
  "images": ["image1.jpg", "image2.jpg"],
  "specifications": {
    "power": "100W",
    "speed": "40000 RPM"
  }
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer user-token
Content-Type: application/json

{
  "items": [
    {
      "product": "64f8a1b2c3d4e5f6a7b8c9d0",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### Get User Orders
```http
GET /api/orders?status=pending&page=1&limit=10
Authorization: Bearer user-token
```

### Cart & Wishlist Endpoints

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer user-token
Content-Type: application/json

{
  "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "quantity": 1
}
```

#### Get Cart
```http
GET /api/cart
Authorization: Bearer user-token
```

#### Add to Wishlist
```http
POST /api/wishlist/add
Authorization: Bearer user-token
Content-Type: application/json

{
  "productId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### Admin Endpoints

#### Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer admin-token
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&role=customer&verified=true
Authorization: Bearer admin-token
```

#### Bulk User Operations
```http
POST /api/admin/users/bulk
Authorization: Bearer admin-token
Content-Type: application/json

{
  "action": "delete",
  "userIds": ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"]
}
```

### IT Monitoring Endpoints

#### System Dashboard
```http
GET /api/it/dashboard
Authorization: Bearer it-admin-token
```

#### System Health
```http
GET /api/it/health
Authorization: Bearer it-admin-token
```

#### Performance Metrics
```http
GET /api/it/performance
Authorization: Bearer it-admin-token
```

#### Database Statistics
```http
GET /api/it/database
Authorization: Bearer it-admin-token
```

#### Error Logs
```http
GET /api/it/logs?level=error&limit=20&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer it-admin-token
```

#### Create Backup
```http
POST /api/it/backup
Authorization: Bearer it-admin-token
```

### Real-time Events (Socket.io)

#### Connect to Socket
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

#### Order Status Update
```javascript
socket.emit('order_status_update', {
  orderId: '64f8a1b2c3d4e5f6a7b8c9d0',
  status: 'shipped',
  trackingNumber: 'TRK123456789'
});
```

#### Send Chat Message
```javascript
socket.emit('send_message', {
  recipientId: '64f8a1b2c3d4e5f6a7b8c9d0',
  message: 'Hello, how can I help you?',
  type: 'text'
});
```

#### Product Viewed
```javascript
socket.emit('product_viewed', {
  productId: '64f8a1b2c3d4e5f6a7b8c9d0'
});
```

## 🔒 Security Features

### Rate Limiting Configuration
```javascript
// General API: 100 requests per 15 minutes
app.use('/api/', apiLimiter);

// Authentication: 5 requests per 15 minutes
app.use('/api/auth', authLimiter);

// Search: 30 requests per minute
app.use('/api/products/search', searchLimiter);

// File Upload: 10 uploads per hour
app.use('/api/products/upload-images', uploadLimiter);

// Admin: 50 requests per 15 minutes
app.use('/api/admin', adminLimiter);
```

### Input Validation Examples
```javascript
// Product validation
const productValidation = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Invalid category ID'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
];
```

### JWT Token Structure
```javascript
// Access Token
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}

// Refresh Token
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "iat": 1640995200,
  "exp": 1641600000
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Examples
```javascript
// Authentication test
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

// Product test
describe('GET /api/products', () => {
  it('should return products with pagination', async () => {
    const response = await request(app)
      .get('/api/products?page=1&limit=10');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('products');
    expect(response.body.data).toHaveProperty('pagination');
  });
});
```

## 📊 Database Schema

### User Schema
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'it_admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  emailPreferences: {
    marketing: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    updates: { type: Boolean, default: true }
  },
  refreshTokens: [String],
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}
```

### Product Schema
```javascript
{
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  stock: { type: Number, required: true, min: 0 },
  images: [String],
  specifications: { type: Map, of: String },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}
```

### Order Schema
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
}
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db:27017/dental-website
JWT_SECRET=your-super-secure-production-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-production-refresh-secret
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client URL
CLIENT_URL=https://your-frontend-domain.com

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=5242880
MAX_FILES=10
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dental-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

## 📈 Performance Optimization

### Database Indexing
```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Product indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

// Order indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
```

### Caching Strategy
```javascript
// Redis caching (recommended for production)
const redis = require('redis');
const client = redis.createClient();

// Cache product data
const cacheProduct = async (productId, productData) => {
  await client.setex(`product:${productId}`, 3600, JSON.stringify(productData));
};

// Get cached product
const getCachedProduct = async (productId) => {
  const cached = await client.get(`product:${productId}`);
  return cached ? JSON.parse(cached) : null;
};
```

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### JWT Token Issues
```bash
# Check JWT secret in .env
echo $JWT_SECRET

# Verify token format
jwt.verify(token, process.env.JWT_SECRET);
```

### Log Analysis
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# Search for specific errors
grep "ERROR" logs/app.log
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new features**
5. **Ensure all tests pass**
   ```bash
   npm test
   ```
6. **Submit a pull request**

### Code Style Guidelines
- Use ES6+ features
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions
- Maintain test coverage above 80%

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
- Review the troubleshooting section

## 🔄 Changelog

### v2.0.0 (Current)
- ✅ Added real-time features with Socket.io
- ✅ Implemented advanced search engine with NLP
- ✅ Added gift card system
- ✅ Added product comparison tools
- ✅ Enhanced admin dashboard with analytics
- ✅ Improved security features
- ✅ Added comprehensive testing suite
- ✅ Added push notifications
- ✅ Added multi-language support
- ✅ Added IT monitoring dashboard

### v1.0.0
- ✅ Basic e-commerce functionality
- ✅ User authentication and authorization
- ✅ Product management
- ✅ Order processing
- ✅ Basic admin features

---

**Ready for production deployment and frontend development!** 🎉 