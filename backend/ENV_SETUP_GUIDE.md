# Environment Variables Setup Guide for Fly.io Deployment

This guide will help you set up all necessary environment variables for your Dental Website backend deployment on Fly.io.

## Prerequisites

1. Fly CLI installed and logged in
2. Your app deployed (run `deploy-fly.cmd` first)
3. All your service credentials ready

## Required Environment Variables

### 1. Firebase Configuration
```cmd
fly secrets set FIREBASE_PROJECT_ID="your-firebase-project-id"
fly secrets set FIREBASE_API_KEY="your-firebase-api-key"
fly secrets set FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
fly secrets set FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
fly secrets set FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
fly secrets set FIREBASE_APP_ID="your-app-id"
fly secrets set FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

### 2. Firebase Admin SDK (Server-side)
```cmd
fly secrets set FIREBASE_ADMIN_PROJECT_ID="your-firebase-project-id"
fly secrets set FIREBASE_ADMIN_PRIVATE_KEY_ID="your-private-key-id"
fly secrets set FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
fly secrets set FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
fly secrets set FIREBASE_ADMIN_CLIENT_ID="your-client-id"
fly secrets set FIREBASE_ADMIN_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
fly secrets set FIREBASE_ADMIN_TOKEN_URI="https://oauth2.googleapis.com/token"
fly secrets set FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
fly secrets set FIREBASE_ADMIN_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
fly secrets set FIREBASE_ADMIN_UNIVERSE_DOMAIN="googleapis.com"
fly secrets set FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
```

### 3. JWT Configuration
```cmd
fly secrets set JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
fly secrets set JWT_EXPIRES_IN="1h"
fly secrets set JWT_REFRESH_EXPIRES_IN="7d"
fly secrets set JWT_ISSUER="dental-kit-store"
fly secrets set JWT_AUDIENCE="dental-kit-users"
fly secrets set JWT_ALGORITHM="HS256"
```

### 4. Client Configuration
```cmd
fly secrets set CLIENT_URL="https://your-frontend-domain.com"
fly secrets set NODE_ENV="production"
```

### 5. Cloudinary Configuration (Image Uploads)
```cmd
fly secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name"
fly secrets set CLOUDINARY_API_KEY="your-api-key"
fly secrets set CLOUDINARY_API_SECRET="your-api-secret"
```

### 6. Email Configuration
```cmd
fly secrets set EMAIL_HOST="smtp.gmail.com"
fly secrets set EMAIL_PORT="587"
fly secrets set EMAIL_USER="your-email@gmail.com"
fly secrets set EMAIL_PASS="your-app-password"
fly secrets set EMAIL_FROM="noreply@yourdomain.com"
```

### 7. Push Notifications (VAPID)
```cmd
fly secrets set VAPID_PUBLIC_KEY="your-vapid-public-key"
fly secrets set VAPID_PRIVATE_KEY="your-vapid-private-key"
```

### 8. Security Configuration
```cmd
fly secrets set API_KEY="your-api-key-for-external-services"
fly secrets set RATE_LIMIT_WINDOW_MS="900000"
fly secrets set RATE_LIMIT_MAX_REQUESTS="100"
fly secrets set MAX_LOGIN_ATTEMPTS="5"
fly secrets set LOGIN_LOCKOUT_DURATION="900000"
fly secrets set SESSION_TIMEOUT="3600000"
fly secrets set CSRF_TOKEN_EXPIRY="86400000"
```

### 9. File Upload Configuration
```cmd
fly secrets set MAX_FILE_SIZE="10485760"
fly secrets set UPLOAD_PATH="./uploads"
fly secrets set ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"
```

### 10. Logging and Monitoring
```cmd
fly secrets set LOG_LEVEL="info"
fly secrets set LOG_FILE="./logs/app.log"
fly secrets set LOG_MAX_SIZE="10485760"
fly secrets set LOG_MAX_FILES="5"
fly secrets set ENABLE_METRICS="true"
fly secrets set METRICS_PORT="9091"
fly secrets set HEALTH_CHECK_INTERVAL="30000"
```

### 11. Socket.IO Configuration
```cmd
fly secrets set SOCKET_CORS_ORIGIN="https://your-frontend-domain.com"
fly secrets set SOCKET_MAX_CONNECTIONS="1000"
```

### 12. Database Connection Pool
```cmd
fly secrets set DB_POOL_SIZE="10"
fly secrets set DB_POOL_TIMEOUT="30000"
fly secrets set DB_POOL_IDLE_TIMEOUT="60000"
```

### 13. Cache Configuration
```cmd
fly secrets set CACHE_TTL="3600"
fly secrets set CACHE_MAX_SIZE="1000"
fly secrets set CACHE_UPDATE_INTERVAL="300000"
```

## Quick Setup Script

You can also use this PowerShell script to set up all variables at once:

```powershell
# Save this as setup-secrets.ps1
$secrets = @{
    "FIREBASE_PROJECT_ID" = "your-firebase-project-id"
    "FIREBASE_API_KEY" = "your-firebase-api-key"
    "FIREBASE_AUTH_DOMAIN" = "your-project.firebaseapp.com"
    "FIREBASE_STORAGE_BUCKET" = "your-project.appspot.com"
    "FIREBASE_MESSAGING_SENDER_ID" = "your-messaging-sender-id"
    "FIREBASE_APP_ID" = "your-app-id"
    "FIREBASE_MEASUREMENT_ID" = "your-measurement-id"
    "JWT_SECRET" = "your-super-secret-jwt-key-here"
    "CLIENT_URL" = "https://your-frontend-domain.com"
    "NODE_ENV" = "production"
    "CLOUDINARY_CLOUD_NAME" = "your-cloud-name"
    "CLOUDINARY_API_KEY" = "your-api-key"
    "CLOUDINARY_API_SECRET" = "your-api-secret"
    "EMAIL_HOST" = "smtp.gmail.com"
    "EMAIL_PORT" = "587"
    "EMAIL_USER" = "your-email@gmail.com"
    "EMAIL_PASS" = "your-app-password"
    "EMAIL_FROM" = "noreply@yourdomain.com"
    "VAPID_PUBLIC_KEY" = "your-vapid-public-key"
    "VAPID_PRIVATE_KEY" = "your-vapid-private-key"
    "API_KEY" = "your-api-key-for-external-services"
    "RATE_LIMIT_WINDOW_MS" = "900000"
    "RATE_LIMIT_MAX_REQUESTS" = "100"
    "MAX_LOGIN_ATTEMPTS" = "5"
    "LOGIN_LOCKOUT_DURATION" = "900000"
    "SESSION_TIMEOUT" = "3600000"
    "CSRF_TOKEN_EXPIRY" = "86400000"
    "MAX_FILE_SIZE" = "10485760"
    "UPLOAD_PATH" = "./uploads"
    "ALLOWED_FILE_TYPES" = "image/jpeg,image/png,image/gif,image/webp"
    "LOG_LEVEL" = "info"
    "LOG_FILE" = "./logs/app.log"
    "LOG_MAX_SIZE" = "10485760"
    "LOG_MAX_FILES" = "5"
    "ENABLE_METRICS" = "true"
    "METRICS_PORT" = "9091"
    "HEALTH_CHECK_INTERVAL" = "30000"
    "SOCKET_CORS_ORIGIN" = "https://your-frontend-domain.com"
    "SOCKET_MAX_CONNECTIONS" = "1000"
    "DB_POOL_SIZE" = "10"
    "DB_POOL_TIMEOUT" = "30000"
    "DB_POOL_IDLE_TIMEOUT" = "60000"
    "CACHE_TTL" = "3600"
    "CACHE_MAX_SIZE" = "1000"
    "CACHE_UPDATE_INTERVAL" = "300000"
}

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "Setting $key..."
    fly secrets set "$key=$value"
}
```

## Verification

After setting all secrets, verify they're set correctly:

```cmd
fly secrets list
```

## Important Notes

1. **Firebase Private Key**: When setting the Firebase private key, make sure to include the `\n` characters for line breaks in the key.

2. **Client URL**: Update the `CLIENT_URL` to match your actual frontend domain.

3. **Email Configuration**: For Gmail, you'll need to use an App Password, not your regular password.

4. **Security**: Never commit your actual secrets to version control. Always use Fly secrets.

5. **Testing**: After setting secrets, restart your app to ensure they're loaded:
   ```cmd
   fly apps restart
   ```

## Troubleshooting

If you encounter issues:

1. Check logs: `fly logs`
2. Verify secrets: `fly secrets list`
3. Restart app: `fly apps restart`
4. Check app status: `fly status`

## Next Steps

After setting up all environment variables:

1. Restart your app: `fly apps restart`
2. Check logs: `fly logs`
3. Test your API endpoints
4. Update your frontend to use the new backend URL
