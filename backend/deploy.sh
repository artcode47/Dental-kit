#!/bin/bash

# Dental Website Backend - Fly.io Deployment Script

set -e

echo "🚀 Starting deployment to Fly.io..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI is not installed. Please install it first:"
    echo "   Windows: iwr https://fly.io/install.ps1 -useb | iex"
    echo "   macOS: brew install flyctl"
    echo "   Linux: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run: fly auth login"
    exit 1
fi

# Check if app exists
if ! fly apps list | grep -q "dental-website-backend"; then
    echo "📱 Creating new Fly app..."
    fly launch --no-deploy --name dental-website-backend
else
    echo "📱 App already exists, proceeding with deployment..."
fi

# Deploy the application
echo "🚀 Deploying application..."
fly deploy

# Check deployment status
echo "📊 Checking deployment status..."
fly status

# Show the app URL
echo "🌐 Your app is deployed at:"
fly info

echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables: fly secrets set KEY=VALUE"
echo "2. Check logs: fly logs"
echo "3. Open app: fly open"
echo "4. Scale if needed: fly scale count 1" 