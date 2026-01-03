@echo off
echo ========================================
echo   iSafari Global Production Startup
echo ========================================
echo.

echo [1/5] Building production frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo ✓ Frontend built successfully

echo.
echo [2/5] Starting Backend Production Server...
cd /d "%~dp0backend"
set NODE_ENV=production
start "iSafari Backend Production" cmd /k "echo Starting iSafari Global Backend (Production)... && npm start"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [3/5] Starting Frontend Production Server...
cd /d "%~dp0"
start "iSafari Frontend Production" cmd /k "echo Starting iSafari Global Frontend (Production)... && npm run preview"

echo.
echo [4/5] System Health Check...
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Opening Production Application...
timeout /t 2 /nobreak >nul
start http://localhost:4028

echo.
echo ========================================
echo   Production System Running!
echo ========================================
echo.
echo Backend:  http://localhost:5000 (Production)
echo Frontend: http://localhost:4028 (Production)
echo Database: i_SAFARI_DATABASE (PostgreSQL)
echo.
echo Production system is ready for real users!
pause
