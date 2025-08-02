# Fly.io Deployment Guide

This guide will help you deploy the Dental Website backend to Fly.io.

## Prerequisites

1. Install the Fly CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up and login to Fly.io:
   ```bash
   fly auth signup
   # or if you already have an account
   fly auth login
   ```

## Environment Variables

Before deploying, you need to set up your environment variables. Create a `.env` file locally with your production values, then set them in Fly.io:

```bash
# Set environment variables
fly secrets set MONGODB_URI="your_mongodb_connection_string"
fly secrets set JWT_SECRET="your_jwt_secret"
fly secrets set CLIENT_URL="https://your-frontend-domain.com"
fly secrets set CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
fly secrets set CLOUDINARY_API_KEY="your_cloudinary_api_key"
fly secrets set CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
fly secrets set EMAIL_HOST="your_email_host"
fly secrets set EMAIL_PORT="587"
fly secrets set EMAIL_USER="your_email_user"
fly secrets set EMAIL_PASS="your_email_password"
fly secrets set VAPID_PUBLIC_KEY="your_vapid_public_key"
fly secrets set VAPID_PRIVATE_KEY="your_vapid_private_key"
```

## Deployment Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create the Fly app (first time only):**
   ```bash
   fly launch
   ```
   - Choose "No" when asked to deploy now
   - Choose "No" when asked to override the fly.toml

3. **Deploy the application:**
   ```bash
   fly deploy
   ```

4. **Check the deployment status:**
   ```bash
   fly status
   ```

5. **View logs:**
   ```bash
   fly logs
   ```

## Post-Deployment

1. **Scale the application (optional):**
   ```bash
   # Scale to 1 instance (minimum for production)
   fly scale count 1
   
   # Scale to multiple instances for high availability
   fly scale count 3
   ```

2. **Set up custom domain (optional):**
   ```bash
   fly certs add your-domain.com
   ```

3. **Monitor your application:**
   ```bash
   # View real-time logs
   fly logs --follow
   
   # Check app status
   fly status
   
   # Open the app in browser
   fly open
   ```

## Health Checks

The application includes health check endpoints:
- `/health` - Root health check for Fly.io
- `/api/health` - API health check

## Troubleshooting

1. **Check application logs:**
   ```bash
   fly logs
   ```

2. **SSH into the machine for debugging:**
   ```bash
   fly ssh console
   ```

3. **Restart the application:**
   ```bash
   fly apps restart
   ```

4. **Destroy and recreate (if needed):**
   ```bash
   fly apps destroy dental-website-backend
   fly launch
   ```

## Important Notes

- The application runs on port 5000 internally
- Health checks are configured to run every 30 seconds
- The app will auto-stop when not in use (cost optimization)
- Make sure your MongoDB instance is accessible from Fly.io's network
- Consider using Fly.io's Postgres for database if you want to migrate from MongoDB

## Cost Optimization

- The app is configured with auto-stop enabled
- Minimum machines running is set to 0
- Uses shared CPU and 512MB RAM
- Consider upgrading to dedicated CPU for production workloads

## Security

- HTTPS is forced for all connections
- Environment variables are stored securely as Fly secrets
- The Docker image runs as a non-root user
- Security headers are configured via Helmet middleware 