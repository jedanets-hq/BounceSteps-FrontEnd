@echo off
echo ========================================
echo VERIFYING FIX FOR PROVIDER PROFILE ISSUE
echo ========================================
echo.

echo 1. Checking if backend is running on port 5000...
netstat -ano | findstr :5000
if %errorlevel% neq 0 (
    echo ❌ Backend is NOT running on port 5000
    echo Please start backend: cd backend && npm run dev
    exit /b 1
) else (
    echo ✅ Backend is running on port 5000
)
echo.

echo 2. Testing backend API endpoints...
node backend\test-backend-api.cjs
echo.

echo 3. Checking API configuration files...
echo.
echo Checking src/utils/api.js:
findstr /C:"localhost:5000" src\utils\api.js
if %errorlevel% neq 0 (
    echo ❌ API configuration NOT updated
) else (
    echo ✅ API configuration updated to localhost
)
echo.

echo Checking src/utils/fetch-wrapper.js:
findstr /C:"localhost:5000" src\utils\fetch-wrapper.js
if %errorlevel% neq 0 (
    echo ❌ Fetch wrapper NOT updated
) else (
    echo ✅ Fetch wrapper updated to localhost
)
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Open browser and go to: http://localhost:5173
echo 2. Press Ctrl + Shift + R to hard refresh
echo 3. Open F12 console and verify:
echo    - Backend URL: http://localhost:5000/api
echo    - Database: Local PostgreSQL
echo 4. Navigate to provider profile: http://localhost:5173/provider/1
echo 5. You should see provider details and services
echo ========================================
pause
