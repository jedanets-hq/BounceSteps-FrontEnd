@echo off
echo ========================================
echo QUICK FIX - Provider & Services Visibility
echo ========================================
echo.

echo [1/3] Checking if backend is running...
curl -s http://localhost:5000/api/services?limit=1 > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is NOT running!
    echo.
    echo Starting backend...
    cd backend
    start "Backend Server" cmd /k "npm start"
    cd ..
    echo ✅ Backend started in new window
    echo Waiting 10 seconds for backend to initialize...
    timeout /t 10 /nobreak > nul
) else (
    echo ✅ Backend is running
)

echo.
echo [2/3] Checking if frontend is running...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend is NOT running!
    echo.
    echo Starting frontend...
    start "Frontend Server" cmd /k "npm run dev"
    echo ✅ Frontend started in new window
    echo Waiting 10 seconds for frontend to initialize...
    timeout /t 10 /nobreak > nul
) else (
    echo ✅ Frontend is running
)

echo.
echo [3/3] Opening browser...
echo.
echo ========================================
echo IMPORTANT INSTRUCTIONS:
echo ========================================
echo.
echo 1. Browser will open in 5 seconds
echo 2. Press Ctrl + Shift + R to HARD REFRESH
echo 3. Or press Ctrl + F5
echo 4. This will clear cache and load fresh data
echo.
echo If services still don't show:
echo - Close browser completely
echo - Open in Incognito/Private mode
echo - Try again
echo.
timeout /t 5 /nobreak > nul

start http://localhost:5173

echo.
echo ========================================
echo ✅ DONE!
echo ========================================
echo.
echo Browser opened. Remember to:
echo 1. Press Ctrl + Shift + R (Hard Refresh)
echo 2. Check console (F12) for any errors
echo.
echo If problems persist, check TEST-ALL-FIXES.md
echo.
pause
