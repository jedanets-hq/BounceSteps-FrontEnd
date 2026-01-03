@echo off
echo ========================================
echo iSafari Global - Deployment with Cache Busting
echo ========================================
echo.

REM Step 1: Clean old build
echo [1/6] Cleaning old build...
if exist dist rmdir /s /q dist
if exist dist\assets rmdir /s /q dist\assets
echo ✅ Old build cleaned
echo.

REM Step 2: Install dependencies
echo [2/6] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 3: Build frontend
echo [3/6] Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
echo.

REM Step 4: Verify build
echo [4/6] Verifying build...
if not exist dist\index.html (
    echo ❌ Build verification failed - index.html not found
    pause
    exit /b 1
)
if not exist dist\version.json (
    echo ❌ Build verification failed - version.json not found
    pause
    exit /b 1
)
if not exist dist\clear-cache.js (
    echo ❌ Build verification failed - clear-cache.js not found
    pause
    exit /b 1
)
echo ✅ Build verified
echo.

REM Step 5: Show build info
echo [5/6] Build Information:
echo.
type dist\version.json
echo.
echo.

REM Step 6: Deploy to Git
echo [6/6] Deploying to GitHub...
git add .
git commit -m "Deploy: Enhanced provider fetching with cache busting - %date% %time%"
git push origin main
if errorlevel 1 (
    echo ❌ Git push failed
    pause
    exit /b 1
)
echo ✅ Pushed to GitHub
echo.

echo ========================================
echo ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Wait 2-3 minutes for Netlify to deploy
echo 2. Open https://isafari-tz.netlify.app in INCOGNITO mode
echo 3. Check console logs (F12) for version info
echo 4. Test Journey Planner Step 4
echo.
echo If providers still don't show:
echo 1. Hard refresh: Ctrl + F5
echo 2. Clear site data: F12 → Application → Clear storage
echo 3. Check backend: https://isafarinetworkglobal-2.onrender.com/api/services
echo.
pause
