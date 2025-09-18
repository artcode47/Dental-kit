# Vercel Environment Variables Setup

## Required Environment Variables

Set these environment variables in your Vercel dashboard:

### 1. API Configuration
```
VITE_API_URL=https://dental-website-backend.fly.dev/api
VITE_SOCKET_URL=https://dental-website-backend.fly.dev
```

### 2. App Configuration
```
VITE_APP_NAME=Dental Kit Store
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Professional Dental Equipment E-commerce Platform
```

### 3. Feature Flags
```
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

### 4. External Services (Optional)
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### 5. Production Settings
```
VITE_DEV_MODE=false
VITE_MOCK_API=false
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Make sure to set them for "Production" environment
6. Redeploy your project

## Important Notes

- The `VITE_API_URL` is the most critical variable - it should point to your deployed backend
- All variables must start with `VITE_` to be accessible in the frontend
- After setting the variables, you need to redeploy for them to take effect
- The frontend will fallback to the hardcoded URL if the environment variable is not set

## Current Configuration

The frontend is currently configured to use:
- **Default API URL**: `https://dental-website-backend.fly.dev/api`
- **Fallback**: If `VITE_API_URL` is not set, it will use the default URL above

This means your frontend will work even without setting environment variables, but it's recommended to set them for better control.
