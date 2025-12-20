@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM 🚀 ISAFARI GLOBAL - QUICK START WITH NEW MONGODB
REM ═══════════════════════════════════════════════════════════════════════════
REM This script helps you quickly set up and start the iSafari system
REM with the new MongoDB connection
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo 🚀 iSAFARI GLOBAL - MONGODB CONNECTION SETUP
echo ═══════════════════════════════════════════════════════════════════════════
echo.

REM Check if password has been set
cd backend
findstr /C:"<db_password>" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ ERROR: MongoDB password not set!
    echo.
    echo 📝 Please follow these steps:
    echo 1. Open backend\.env file
    echo 2. Find the line: MONGODB_URI=mongodb+srv://mfungojoctan01_db_user:^<db_password^>@...
    echo 3. Replace ^<db_password^> with your actual MongoDB password
    echo 4. Save the file
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ MongoDB password is set
echo.
echo 🧪 Testing MongoDB connection...
echo.

node test-new-mongodb-connection.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ MongoDB connection test failed!
    echo.
    echo 📝 Please check:
    echo 1. MongoDB password is correct in backend\.env
    echo 2. Your IP is whitelisted in MongoDB Atlas
    echo 3. MongoDB cluster is accessible
    echo 4. Internet connection is stable
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo ✅ MongoDB connection successful!
echo ═══════════════════════════════════════════════════════════════════════════
echo.
echo 🚀 Starting iSafari Global System...
echo.
echo This will start:
echo   1. Backend API (Port 5000)
echo   2. Frontend/Traveller Portal (Port 4028)
echo   3. Service Provider Portal (Port 4028)
echo.
echo 📝 Admin Portal can be started separately with: cd admin-portal ^&^& npm run dev
echo.
pause

REM Go back to root
cd ..

REM Start the system
echo.
echo 🚀 Starting all services...
echo.

start "iSafari Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

start "iSafari Frontend" cmd /k "npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo ✅ iSAFARI SYSTEM STARTED SUCCESSFULLY!
echo ═══════════════════════════════════════════════════════════════════════════
echo.
echo 🌐 Access the portals:
echo.
echo   📱 Traveller Portal:       http://localhost:4028
echo   🏢 Service Provider Portal: http://localhost:4028
echo   🔧 Admin Portal:            cd admin-portal ^&^& npm run dev
echo   🔌 Backend API:             http://localhost:5000/api
echo.
echo 📊 Test Backend Health:
echo   curl http://localhost:5000/api/health
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo.
pause
