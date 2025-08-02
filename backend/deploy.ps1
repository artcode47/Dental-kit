# Dental Website Backend - Fly.io Deployment Script (PowerShell)

param(
    [switch]$SkipChecks
)

Write-Host "🚀 Starting deployment to Fly.io..." -ForegroundColor Green

# Check if fly CLI is installed
if (-not (Get-Command fly -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Fly CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   Run: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    fly auth whoami | Out-Null
} catch {
    Write-Host "❌ Not logged in to Fly.io. Please run: fly auth login" -ForegroundColor Red
    exit 1
}

# Check if app exists
$appExists = fly apps list 2>$null | Select-String "dental-website-backend"

if (-not $appExists) {
    Write-Host "📱 Creating new Fly app..." -ForegroundColor Yellow
    fly launch --no-deploy --name dental-website-backend
} else {
    Write-Host "📱 App already exists, proceeding with deployment..." -ForegroundColor Yellow
}

# Deploy the application
Write-Host "🚀 Deploying application..." -ForegroundColor Green
fly deploy

# Check deployment status
Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
fly status

# Show the app URL
Write-Host "🌐 Your app is deployed at:" -ForegroundColor Green
fly info

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up environment variables: fly secrets set KEY=VALUE" -ForegroundColor White
Write-Host "2. Check logs: fly logs" -ForegroundColor White
Write-Host "3. Open app: fly open" -ForegroundColor White
Write-Host "4. Scale if needed: fly scale count 1" -ForegroundColor White 