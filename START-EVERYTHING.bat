@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM 🚀 ISAFARI GLOBAL - START COMPLETE SYSTEM WITH MONGODB
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo 🚀 STARTING ISAFARI GLOBAL SYSTEM
echo ═══════════════════════════════════════════════════════════════════════════
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ❌ ERROR: backend\.env file not found!
    echo.
    echo 📝 Please run setup-mongodb-password.bat first
    pause
    exit /b 1
)

echo ✅ Configuration files found
echo.

REM Start Backend in new window
echo 🔧 Starting Backend Server (Port 5000)...
start "iSafari Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

REM Start Frontend in new window
echo 🌐 Starting Traveller Portal (Port 4028)...
start "iSafari Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Start Admin Portal in new window
echo 👨‍💼 Starting Admin Portal (Port 5173)...
start "iSafari Admin" cmd /k "cd admin-portal && npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo ✅ ALL SYSTEMS STARTED!
echo ═══════════════════════════════════════════════════════════════════════════
echo.
echo 📱 Access your portals:
echo.
echo    🌍 Traveller Portal:      http://localhost:4028
echo    💼 Service Provider:      http://localhost:4028
echo    👨‍💼 Admin Portal:          http://localhost:5173
echo    🔌 Backend API:           http://localhost:5000/api
echo.
echo 💾 Database: MongoDB Atlas (Connected)
echo.
echo ⚠️  To stop all services, close all terminal windows
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo.
pause
