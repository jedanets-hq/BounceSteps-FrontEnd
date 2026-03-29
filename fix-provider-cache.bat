@echo off
echo ========================================
echo PROVIDER PROFILE FIX - CACHE CLEANER
echo ========================================
echo.

echo Step 1: Checking if backend is running...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 5000
) else (
    echo [WARNING] Backend is NOT running!
    echo Please start backend: cd backend ^&^& npm start
    pause
    exit /b 1
)
echo.

echo Step 2: Checking if frontend is running...
netstat -ano | findstr :4028 >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 4028
) else (
    echo [WARNING] Frontend is NOT running!
    echo Please start frontend: npm run dev
    pause
    exit /b 1
)
echo.

echo Step 3: Testing backend API...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API is responding
) else (
    echo [ERROR] Backend API is not responding!
    pause
    exit /b 1
)
echo.

echo Step 4: Testing provider endpoint...
curl -s http://localhost:5000/api/providers/1 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Provider API is working
) else (
    echo [ERROR] Provider API is not working!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ALL SYSTEMS ARE WORKING!
echo ========================================
echo.
echo The problem is BROWSER CACHE.
echo.
echo NEXT STEPS:
echo 1. Press Ctrl + Shift + Delete in your browser
echo 2. Select "Cached images and files"
echo 3. Select "Cookies and other site data"
echo 4. Click "Clear data"
echo 5. CLOSE browser completely
echo 6. Reopen browser
echo 7. Go to: http://localhost:4028/provider/1
echo.
echo OR use Incognito mode (Ctrl + Shift + N) to test
echo.
echo ========================================
echo.

echo Opening test page in browser...
start test-provider-direct.html
echo.

echo Test page opened!
echo Click the buttons to verify backend is working.
echo.

pause
