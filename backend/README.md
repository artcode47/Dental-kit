# Dental Website Backend

A comprehensive, production-ready backend for a dental equipment e-commerce website with advanced features including real-time communication, advanced search, gift cards, product comparison, admin dashboard, and enhanced security.

## 🚀 Features Implemented

### 1. Real-time Features (WebSocket Integration)
- **Socket.io Integration**: Real-time bidirectional communication
- **Order Status Updates**: Live order tracking and status notifications
- **Inventory Management**: Real-time stock updates and low stock alerts
- **Live Chat Support**: Customer support chat functionality
- **Product View Tracking**: Real-time analytics for product views
- **Typing Indicators**: Real-time typing status in chat
- **Admin Notifications**: Real-time admin dashboard updates

### 2. Advanced Search & Discovery
- **Natural Language Processing**: Intelligent search with stemming and tokenization
- **Advanced Filtering**: Price, rating, availability, category, vendor filters
- **Search Suggestions**: Autocomplete functionality
- **Popular Searches**: Trending search analytics
- **Product Recommendations**: AI-powered product suggestions
- **Search History**: User search behavior tracking
- **Relevance Scoring**: Smart product ranking algorithm

### 3. Advanced E-commerce Features
- **Gift Card System**: Digital and physical gift cards with expiration
- **Product Comparison**: Side-by-side product comparison with sharing
- **Inventory Management**: Low stock alerts and automated notifications
- **Bulk Operations**: Mass product and user management
- **Recently Viewed Products**: User behavior tracking
- **Product Variants**: Advanced product configuration options
- **Bundle Products**: Product bundling with discounts

### 4. Admin Dashboard & Management
- **Comprehensive Analytics**: Sales, user, and product analytics
- **Real-time Dashboard**: Live statistics and monitoring
- **User Management**: Bulk user operations and detailed user analytics
- **Product Management**: Advanced product management with bulk operations
- **Order Management**: Complete order lifecycle management
- **System Health Monitoring**: Performance and health checks
- **Advanced Reporting**: Customizable reports and exports

### 5. Security Enhancements
- **Advanced Rate Limiting**: Granular rate limiting for different endpoints
- **IP Blocking**: Dynamic IP blocking and whitelisting
- **SQL Injection Protection**: Comprehensive input validation
- **XSS Protection**: Cross-site scripting prevention
- **Request Logging**: Detailed request/response logging
- **API Key Validation**: Secure API access control
- **Enhanced CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Comprehensive security header implementation

### 6. Testing & Quality Assurance
- **Comprehensive Test Suite**: Unit and integration tests
- **Socket.io Testing**: Real-time feature testing
- **Search Engine Testing**: Advanced search functionality testing
- **API Testing**: Complete endpoint testing
- **Coverage Reporting**: Code coverage analysis
- **Test Utilities**: Reusable test helpers and mocks

### 7. Advanced Features
- **Push Notifications**: Web push notifications for user engagement
- **Social Media Integration**: Ready for social media features
- **Affiliate Marketing System**: Referral and commission tracking
- **Advanced Loyalty Program**: Points, tiers, and rewards
- **A/B Testing Framework**: Ready for experimentation
- **SEO Optimization Tools**: Meta tags and structured data

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer with Handlebars templates
- **Search**: Natural language processing with custom indexing
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Testing**: Jest with Supertest
- **Push Notifications**: Web Push API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dental-website
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   CLIENT_URL=http://localhost:3000
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Push Notifications
   VAPID_PUBLIC_KEY=your-vapid-public-key
   VAPID_PRIVATE_KEY=your-vapid-private-key
   ```

4. **Database Setup**
   ```bash
   # Ensure MongoDB is running
   mongod
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🧪 Testing

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

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Product Endpoints
- `GET /api/products` - Get all products with filtering
- `GET /api/products/search` - Advanced search
- `GET /api/products/search/suggestions` - Search suggestions
- `GET /api/products/search/popular` - Popular searches
- `GET /api/products/recommendations` - Product recommendations
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Order Endpoints
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

### Gift Card Endpoints
- `POST /api/gift-cards` - Create gift card
- `GET /api/gift-cards/code/:code` - Get gift card by code
- `POST /api/gift-cards/use` - Use gift card
- `GET /api/gift-cards/user` - Get user's gift cards
- `GET /api/gift-cards/:id/history` - Gift card usage history

### Product Comparison Endpoints
- `GET /api/comparisons` - Get user's comparison
- `POST /api/comparisons/add` - Add product to comparison
- `DELETE /api/comparisons/remove/:productId` - Remove product
- `DELETE /api/comparisons/clear` - Clear comparison
- `GET /api/comparisons/public/:shareToken` - Get public comparison

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `POST /api/admin/users/bulk` - Bulk user operations
- `GET /api/admin/products` - Product management
- `POST /api/admin/products/bulk` - Bulk product operations
- `GET /api/admin/orders` - Order management
- `GET /api/admin/analytics` - Advanced analytics
- `GET /api/admin/health` - System health check

### Real-time Events (Socket.io)
- `order_status_update` - Update order status
- `inventory_update` - Update product inventory
- `product_viewed` - Track product views
- `send_message` - Send chat message
- `typing` - Typing indicator

## 🔒 Security Features

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Search: 30 requests per minute
- File Upload: 10 uploads per hour
- Admin: 50 requests per 15 minutes

### Input Validation
- SQL injection protection
- XSS protection
- Request size limiting (10MB)
- Comprehensive input sanitization

### Authentication & Authorization
- JWT-based authentication
- Refresh token rotation
- Multi-factor authentication (MFA)
- Session management
- Role-based access control

## 📊 Monitoring & Analytics

### Real-time Metrics
- Active user count
- Order processing status
- Inventory levels
- System performance

### Analytics Dashboard
- Sales analytics
- User behavior tracking
- Product performance
- Revenue reporting

## 🚀 Deployment

### Production Checklist
- [ ] Set environment variables
- [ ] Configure database
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring (PM2)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

### Docker Deployment
```bash
# Build image
docker build -t dental-website-backend .

# Run container
docker run -p 5000:5000 dental-website-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v2.0.0 (Current)
- Added real-time features with Socket.io
- Implemented advanced search engine
- Added gift card system
- Added product comparison
- Enhanced admin dashboard
- Improved security features
- Added comprehensive testing
- Added push notifications

### v1.0.0
- Basic e-commerce functionality
- User authentication
- Product management
- Order processing
- Basic admin features 