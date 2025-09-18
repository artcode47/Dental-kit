@echo off
REM Dental Website Backend - Fly.io Deployment Script for Windows CMD
REM This script prepares and deploys the backend to Fly.io on a different account

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Dental Website Backend - Fly.io Deploy
echo ========================================
echo.

REM Check if flyctl CLI is installed
where flyctl >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Fly CLI is not installed or not in PATH.
    echo.
    echo Please install Fly CLI first:
    echo   PowerShell: iwr https://fly.io/install.ps1 -useb ^| iex
    echo   Or download from: https://fly.io/docs/hands-on/install-flyctl/
    echo.
    pause
    exit /b 1
)

REM Check if user is logged in
flyctl auth whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Not logged in to Fly.io. Please login first.
    echo.
    echo Run: flyctl auth login
    echo.
    pause
    exit /b 1
)

echo [INFO] Fly CLI is installed and user is logged in.
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the backend directory.
    echo.
    pause
    exit /b 1
)

if not exist "fly.toml" (
    echo [ERROR] fly.toml not found. Please ensure you're in the backend directory.
    echo.
    pause
    exit /b 1
)

echo [INFO] Backend directory confirmed.
echo.

REM Check if app exists
echo [INFO] Checking if app exists...
flyctl apps list | findstr "dental-website-backend" >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] App does not exist. Creating new Fly app...
    echo.
    echo [WARNING] You will be prompted to:
    echo   1. Choose an app name (or use default: dental-website-backend)
    echo   2. Choose a region (or use default: iad)
    echo   3. Choose not to deploy now (we'll deploy manually)
    echo   4. Choose not to override fly.toml
    echo.
    pause
    flyctl launch --no-deploy
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create Fly app.
        pause
        exit /b 1
    )
) else (
    echo [INFO] App already exists, proceeding with deployment...
)

echo.
echo [INFO] Starting deployment...
echo.

REM Deploy the application
flyctl deploy
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployment completed successfully!
echo.

REM Check deployment status
echo [INFO] Checking deployment status...
flyctl status

echo.
echo [INFO] Getting app information...
flyctl info

echo.
echo ========================================
echo  Deployment Summary
echo ========================================
echo.
echo [SUCCESS] Your backend is now deployed on Fly.io!
echo.
echo Next steps:
echo 1. Set up environment variables:
echo    flyctl secrets set JWT_SECRET="your-jwt-secret"
echo    flyctl secrets set FIREBASE_PROJECT_ID="your-firebase-project-id"
echo    flyctl secrets set CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
echo    flyctl secrets set CLOUDINARY_API_KEY="your-cloudinary-key"
echo    flyctl secrets set CLOUDINARY_API_SECRET="your-cloudinary-secret"
echo    flyctl secrets set EMAIL_USER="your-email"
echo    flyctl secrets set EMAIL_PASS="your-email-password"
echo    flyctl secrets set CLIENT_URL="https://your-frontend-domain.com"
echo.
echo 2. Check logs: flyctl logs
echo 3. Open app: flyctl open
echo 4. Scale if needed: flyctl scale count 1
echo.
echo For a complete list of environment variables, see env.example
echo.

pause
