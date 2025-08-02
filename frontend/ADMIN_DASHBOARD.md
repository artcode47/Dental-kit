# Admin Dashboard

## Overview

The Admin Dashboard is a comprehensive management interface for the Dental E-commerce platform. It provides administrators with tools to manage users, products, orders, and view analytics.

## Features

### 🎯 Dashboard Overview
- **Statistics Cards**: Display key metrics including total users, products, orders, and revenue
- **Real-time Analytics**: Charts showing weekly revenue trends and category performance
- **Recent Activity**: Live feed of system activities and notifications
- **Quick Actions**: Fast access to common administrative tasks

### 📊 Analytics & Reporting
- **Revenue Analytics**: Weekly and monthly revenue tracking
- **Category Performance**: Revenue breakdown by product categories
- **Top Products**: Best-selling products with sales metrics
- **Low Stock Alerts**: Products running low on inventory

### 👥 User Management
- **User Overview**: Total registered users and growth metrics
- **User Verification**: Manage user account verification status
- **Bulk Operations**: Perform actions on multiple users simultaneously

### 🛍️ Product Management
- **Product Catalog**: Manage all products in the system
- **Category Management**: Organize products into categories
- **Inventory Tracking**: Monitor stock levels and set alerts
- **Bulk Operations**: Update multiple products at once

### 📦 Order Management
- **Order Tracking**: View and manage all customer orders
- **Status Updates**: Update order and payment status
- **Order Analytics**: Track order trends and performance

### 🏪 Vendor Management
- **Vendor Accounts**: Manage vendor registrations and profiles
- **Vendor Performance**: Track vendor sales and ratings
- **Approval System**: Approve or reject vendor applications

### ⭐ Review Management
- **Product Reviews**: Moderate customer reviews and ratings
- **Review Analytics**: Track review trends and sentiment
- **Quality Control**: Ensure review quality and authenticity

### 🎫 Coupon & Gift Card Management
- **Discount Coupons**: Create and manage promotional codes
- **Gift Cards**: Issue and track gift card usage
- **Promotional Campaigns**: Manage marketing campaigns

## Components

### Core Components

#### `AdminLayout`
- Main layout wrapper for admin pages
- Includes AdminHeader and AdminSidebar
- Handles responsive design and RTL support

#### `AdminHeader`
- Top navigation bar with search functionality
- User profile dropdown and notifications
- Language and theme toggles

#### `AdminSidebar`
- Navigation menu with all admin sections
- Mobile-responsive with collapsible design
- Active state indicators

#### `StatsCard`
- Displays key metrics with change indicators
- Supports different data formats (number, currency, percentage)
- Color-coded for different metric types

#### `Chart`
- Interactive charts for analytics data
- Supports line, bar, and pie chart types
- Responsive design with hover effects

#### `RecentActivity`
- Live activity feed with timestamps
- Different activity types with appropriate icons
- Status indicators for completed/pending actions

#### `QuickActions`
- Grid of quick action buttons
- Links to common administrative tasks
- Help section for user support

### API Integration

The dashboard uses the `adminApi.js` service for all backend communication:

```javascript
import { 
  getDashboardStats, 
  getAllUsers, 
  getAllProducts,
  getAnalytics 
} from '../services/adminApi';
```

### Mock Data

For development and testing, the dashboard includes comprehensive mock data:

- **Dashboard Statistics**: Realistic metrics and trends
- **Recent Activity**: Sample activity feed
- **Analytics Data**: Chart data for visualization

## Internationalization

The dashboard fully supports Arabic and English languages:

- **RTL Support**: Proper right-to-left layout for Arabic
- **Translated Content**: All text and labels are translated
- **Cultural Adaptation**: Date formats and number formatting

## Dark Mode Support

Complete dark mode implementation:

- **Theme Toggle**: Switch between light and dark modes
- **Consistent Styling**: All components support both themes
- **Color Schemes**: Appropriate color palettes for each theme

## Mobile Responsiveness

Fully responsive design:

- **Mobile Menu**: Collapsible sidebar for mobile devices
- **Touch-Friendly**: Optimized for touch interactions
- **Adaptive Layout**: Grid layouts that adapt to screen size

## Security

- **Protected Routes**: Admin routes require authentication
- **Role-Based Access**: Only admin users can access
- **Session Management**: Secure session handling

## Usage

### Accessing the Dashboard

1. Navigate to `/admin` in your browser
2. Login with admin credentials
3. The dashboard will load with overview statistics

### Navigation

- Use the sidebar to navigate between different sections
- The header provides quick access to search and user settings
- Breadcrumbs show your current location

### Quick Actions

- Click on quick action cards to perform common tasks
- Use the search bar to find specific items
- Access help and support through the help section

## Development

### Adding New Sections

1. Create new components in `src/components/admin/`
2. Add routes in the main router
3. Update the sidebar navigation
4. Add translations for new content

### Customizing Analytics

1. Modify the chart components to display different data
2. Update the API service to fetch new metrics
3. Add new chart types as needed

### Styling

The dashboard uses Tailwind CSS with custom components:

- **Consistent Design**: Follow the established design system
- **Dark Mode**: Ensure all new components support dark mode
- **Responsive**: Test on different screen sizes

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: More detailed reporting and insights
- **Export Features**: PDF and Excel export capabilities
- **Notification System**: Push notifications for important events
- **Audit Logs**: Comprehensive activity logging
- **API Documentation**: Interactive API documentation
- **Performance Monitoring**: System health and performance metrics 