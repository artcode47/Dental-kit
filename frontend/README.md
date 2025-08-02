# Dental E-commerce Frontend

A modern, responsive React frontend for the Dental Equipment E-commerce platform built with Vite, featuring advanced UI components, real-time features, and comprehensive user experience.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file (see `env.example` for all available options):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_APP_NAME=Dental Kit Store
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### 🚀 Production Deployment (Vercel)

For production deployment to Vercel, see the [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md).

**Quick deployment:**
```bash
# Windows (PowerShell)
.\deploy-vercel.ps1

# Linux/macOS
./deploy-vercel.sh
```

## 🛠 Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context + React Query
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form with Yup validation
- **UI Components**: Custom components with Framer Motion
- **Internationalization**: i18next with RTL support
- **Real-time**: Socket.io Client
- **Authentication**: JWT with refresh tokens
- **Testing**: Vitest with React Testing Library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── common/         # Common components (Header, Footer, etc.)
│   ├── layout/         # Layout components
│   ├── products/       # Product-related components
│   ├── routes/         # Route protection components
│   └── ui/             # Base UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   └── vendor/         # Vendor pages
├── services/           # API services and utilities
├── utils/              # Utility functions
└── locales/            # Internationalization files
```

## 🎨 Design System

The application uses a comprehensive design system with:
- **Color System**: Consistent color palette with dark/light mode support
- **Typography**: Custom font hierarchy and spacing
- **Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with breakpoint system

## 🔧 Configuration

### Environment Variables

See `env.example` for all available environment variables.

### Vite Configuration

The `vite.config.js` includes:
- Path aliases for clean imports
- Development proxy for API calls
- Production optimizations
- Security headers
- Code splitting configuration

### Build Optimization

- **Code Splitting**: Automatic chunk splitting for better performance
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Security**: Production security headers and CSP

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📦 Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🚀 Performance Features

- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Automatic image optimization
- **Caching**: Strategic caching for static assets
- **Bundle Analysis**: Built-in bundle analysis tools
- **Performance Monitoring**: Core Web Vitals tracking

## 🔒 Security Features

- **CSP Headers**: Content Security Policy implementation
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Cross-Site Request Forgery prevention
- **Secure Headers**: Comprehensive security headers
- **Environment Variables**: Secure configuration management

## 🌐 Internationalization

- **Multi-language Support**: English, Arabic, and more
- **RTL Support**: Right-to-left layout support
- **Dynamic Language Switching**: Runtime language changes
- **Localized Content**: Language-specific content and formatting

## 📱 Progressive Web App (PWA)

- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Native app-like interface
- **Push Notifications**: Web push notification support
- **Install Prompt**: Add to home screen functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready for production deployment!** 🎉
