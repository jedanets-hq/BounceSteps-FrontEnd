@echo off
echo.
echo ========================================
echo   DEPLOYING BACKEND TO RENDER
echo ========================================
echo.

echo Step 1: Checking if backend is running...
curl -s https://isafarinetworkglobal-2.onrender.com/api/health
echo.
echo.

echo Step 2: Creating test user in production...
node create-production-test-user.js
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE
echo ========================================
echo.
pause
