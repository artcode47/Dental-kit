# PowerShell script to set up Fly.io secrets
# Run this script after deploying your app

Write-Host "Setting up Fly.io secrets for Dental Website Backend..." -ForegroundColor Green
Write-Host ""

# Check if fly CLI is available
if (-not (Get-Command fly -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Fly CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Fly CLI first: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
$whoami = fly auth whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Not logged in to Fly.io" -ForegroundColor Red
    Write-Host "Please run: fly auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Logged in as: $whoami" -ForegroundColor Cyan
Write-Host ""

# Define all required secrets with placeholder values
$secrets = @{
    "FIREBASE_PROJECT_ID" = "your-firebase-project-id"
    "FIREBASE_API_KEY" = "your-firebase-api-key"
    "FIREBASE_AUTH_DOMAIN" = "your-project.firebaseapp.com"
    "FIREBASE_STORAGE_BUCKET" = "your-project.appspot.com"
    "FIREBASE_MESSAGING_SENDER_ID" = "your-messaging-sender-id"
    "FIREBASE_APP_ID" = "your-app-id"
    "FIREBASE_MEASUREMENT_ID" = "your-measurement-id"
    "FIREBASE_ADMIN_PROJECT_ID" = "your-firebase-project-id"
    "FIREBASE_ADMIN_PRIVATE_KEY_ID" = "your-private-key-id"
    "FIREBASE_ADMIN_PRIVATE_KEY" = "-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
    "FIREBASE_ADMIN_CLIENT_EMAIL" = "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
    "FIREBASE_ADMIN_CLIENT_ID" = "your-client-id"
    "FIREBASE_ADMIN_AUTH_URI" = "https://accounts.google.com/o/oauth2/auth"
    "FIREBASE_ADMIN_TOKEN_URI" = "https://oauth2.googleapis.com/token"
    "FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL" = "https://www.googleapis.com/oauth2/v1/certs"
    "FIREBASE_ADMIN_CLIENT_X509_CERT_URL" = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
    "FIREBASE_ADMIN_UNIVERSE_DOMAIN" = "googleapis.com"
    "FIREBASE_STORAGE_BUCKET" = "your-project.firebasestorage.app"
    "JWT_SECRET" = "your-super-secret-jwt-key-here-change-this-in-production"
    "JWT_EXPIRES_IN" = "1h"
    "JWT_REFRESH_EXPIRES_IN" = "7d"
    "JWT_ISSUER" = "dental-kit-store"
    "JWT_AUDIENCE" = "dental-kit-users"
    "JWT_ALGORITHM" = "HS256"
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

Write-Host "This script will set up placeholder values for all required secrets." -ForegroundColor Yellow
Write-Host "You MUST update these with your actual values after running this script." -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Setting up secrets..." -ForegroundColor Green

$successCount = 0
$totalCount = $secrets.Count

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "Setting $key..." -NoNewline
    
    $result = fly secrets set "$key=$value" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Secrets setup completed: $successCount/$totalCount successful" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($successCount -eq $totalCount) {
    Write-Host ""
    Write-Host "✓ All secrets set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Update the following secrets with your actual values:" -ForegroundColor Red
    Write-Host "1. Firebase configuration (FIREBASE_*)"
    Write-Host "2. JWT_SECRET (generate a strong secret)"
    Write-Host "3. CLIENT_URL (your frontend domain)"
    Write-Host "4. Cloudinary credentials (CLOUDINARY_*)"
    Write-Host "5. Email credentials (EMAIL_*)"
    Write-Host "6. VAPID keys (VAPID_*)"
    Write-Host ""
    Write-Host "Use: fly secrets set KEY=VALUE" -ForegroundColor Cyan
    Write-Host "View all secrets: fly secrets list" -ForegroundColor Cyan
    Write-Host "Restart app: fly apps restart" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Some secrets failed to set. Please check the errors above and try again." -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update secrets with actual values"
Write-Host "2. Restart the app: fly apps restart"
Write-Host "3. Check logs: fly logs"
Write-Host "4. Test the app: fly open"
