# Vercel Deployment Guide

This guide will help you deploy the Dental Website frontend to Vercel.

## Prerequisites

1. **Install Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

2. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

## Quick Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect your repository to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Select the `frontend` folder as the root directory

3. **Configure build settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set environment variables**:
   - Go to Project Settings → Environment Variables
   - Add the following variables:

   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   VITE_SOCKET_URL=https://your-backend-domain.com
   VITE_APP_NAME=Dental Kit Store
   VITE_ENABLE_PWA=true
   VITE_ENABLE_ANALYTICS=false
   ```

5. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Option 2: Deploy via CLI

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set environment variables when prompted

## Environment Variables

### Required Variables

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com

# App Configuration
VITE_APP_NAME=Dental Kit Store
VITE_APP_VERSION=1.0.0
```

### Optional Variables

```env
# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false

# External Services
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn
```

## Configuration Files

### vercel.json
The `vercel.json` file is already configured with:
- Build settings for Vite
- SPA routing (all routes redirect to index.html)
- Security headers
- API proxy configuration
- Asset caching

### vite.config.js
The Vite configuration is optimized for production with:
- Code splitting
- Tree shaking
- Security optimizations
- Performance optimizations

## Post-Deployment

### 1. Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add your-domain.com

# Or through dashboard:
# Project Settings → Domains → Add Domain
```

### 2. Environment Variables for Different Environments
```bash
# Production
vercel env add VITE_API_URL production
vercel env add VITE_SOCKET_URL production

# Preview (staging)
vercel env add VITE_API_URL preview
vercel env add VITE_SOCKET_URL preview
```

### 3. Automatic Deployments
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from pull requests
- **Development**: Deploys from other branches

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   vercel logs

   # Test build locally
   npm run build
   ```

2. **Environment Variables Not Working**:
   ```bash
   # Check environment variables
   vercel env ls

   # Redeploy after adding env vars
   vercel --prod
   ```

3. **API Connection Issues**:
   - Ensure your backend is deployed and accessible
   - Check CORS configuration on your backend
   - Verify environment variables are set correctly

4. **Routing Issues**:
   - The `vercel.json` includes SPA routing
   - All routes should redirect to `index.html`
   - Check the routes configuration if issues persist

### Performance Optimization

1. **Enable Edge Functions** (if needed):
   ```json
   {
     "functions": {
       "api/*.js": {
         "runtime": "edge"
       }
     }
   }
   ```

2. **Image Optimization**:
   - Use Vercel's Image Optimization
   - Configure `next.config.js` for image domains

3. **Caching**:
   - Static assets are cached automatically
   - API responses can be cached with headers

## Monitoring and Analytics

### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Performance Monitoring
- Vercel provides built-in performance monitoring
- Check the "Speed Insights" tab in your dashboard
- Monitor Core Web Vitals

## Security

### Security Headers
The `vercel.json` includes security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Environment Variables
- Never commit sensitive data to your repository
- Use Vercel's environment variables for secrets
- Different environments can have different values

## Cost Optimization

### Vercel Pricing
- **Hobby**: Free tier with limitations
- **Pro**: $20/month for more features
- **Enterprise**: Custom pricing

### Optimization Tips
- Use static generation where possible
- Optimize images and assets
- Enable compression
- Use CDN for static assets

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Vercel Support**: Available in Pro and Enterprise plans

## Next Steps

After deployment:
1. Test all functionality
2. Set up monitoring and analytics
3. Configure custom domain (if needed)
4. Set up CI/CD for automatic deployments
5. Monitor performance and optimize 