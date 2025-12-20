@echo off
echo ========================================
echo    iSafari Global System Startup
echo ========================================
echo.

echo [1/4] Checking system requirements...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found! Please install Node.js with npm.
    pause
    exit /b 1
)

echo ✓ Node.js and npm found

echo.
echo [2/4] Starting PostgreSQL database check...
echo Please ensure PostgreSQL is running and i_SAFARI_DATABASE exists
echo.

echo [3/4] Starting Backend Server...
cd /d "%~dp0backend"
start "iSafari Backend" cmd /k "echo Starting iSafari Global Backend... && npm start"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend Development Server...
cd /d "%~dp0"
start "iSafari Frontend" cmd /k "echo Starting iSafari Global Frontend... && npm run dev"

echo.
echo ========================================
echo    iSafari Global System Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:4028
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:4028

echo.
echo System is now running!
echo Close this window to keep servers running.
echo To stop servers, close the Backend and Frontend windows.
pause
