@echo off
echo ========================================
echo    RESTARTING iSAFARI GLOBAL - FRESH
echo ========================================
echo.

echo [1/5] Stopping all running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Clearing dist folder...
if exist dist rmdir /s /q dist
echo Dist folder cleared!

echo [3/5] Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo Vite cache cleared!

echo [4/5] Starting backend server...
start "iSafari Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo [5/5] Starting frontend server...
start "iSafari Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo IMPORTANT: 
echo 1. Wait 10 seconds for servers to start
echo 2. Open: CLEAR-CACHE-NOW.html in browser
echo 3. Click "CLEAR EVERYTHING NOW"
echo 4. Then open: http://localhost:5173
echo.
pause
