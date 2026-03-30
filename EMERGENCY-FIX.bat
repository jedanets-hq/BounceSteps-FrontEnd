@echo off
echo ========================================
echo EMERGENCY FIX - Provider Profile Issue
echo ========================================
echo.

echo Step 1: Stopping all processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo Step 2: Starting backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 >nul

echo Step 3: Starting frontend...
start "Frontend Dev" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Wait for both servers to start (10-15 seconds)
echo 2. Open browser: http://localhost:5173
echo 3. Press Ctrl + Shift + Delete
echo 4. Select "Cached images and files"
echo 5. Click "Clear data"
echo 6. Press Ctrl + Shift + R (Hard Refresh)
echo 7. Navigate to provider profile
echo ========================================
echo.
echo Press any key when servers are ready...
pause
