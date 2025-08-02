# Dental Website Frontend - Vercel Deployment Script (PowerShell)

param(
    [switch]$SkipBuild
)

Write-Host "🚀 Starting Vercel deployment..." -ForegroundColor Green

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI is not installed. Installing now..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if user is logged in
try {
    vercel whoami | Out-Null
} catch {
    Write-Host "❌ Not logged in to Vercel. Please run: vercel login" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "📝 Please update .env file with your production values before deploying" -ForegroundColor Cyan
}

# Build the project locally to check for errors
if (-not $SkipBuild) {
    Write-Host "🔨 Building project locally..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed. Please fix the errors before deploying" -ForegroundColor Red
        exit 1
    }
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check your deployment at the provided URL" -ForegroundColor White
Write-Host "2. Set up environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "3. Configure custom domain if needed" -ForegroundColor White
Write-Host "4. Test all functionality" -ForegroundColor White 