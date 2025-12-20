@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM 🔐 ISAFARI GLOBAL - MONGODB PASSWORD SETUP (Windows Batch)
REM ═══════════════════════════════════════════════════════════════════════════
REM Simple batch script to help set MongoDB password
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo 🔐 iSAFARI GLOBAL - MONGODB PASSWORD SETUP
echo ═══════════════════════════════════════════════════════════════════════════
echo.

REM Check if .env file exists
if not exist "backend\.env" (
    echo ❌ ERROR: backend\.env file not found!
    echo.
    echo 📝 Please make sure you are running this script from the isafari_global root directory
    pause
    exit /b 1
)

echo 📝 Enter your MongoDB password:
echo    (This is the password for user: mfungojoctan01_db_user)
echo.
set /p DB_PASSWORD="Password: "
echo.

REM Create backup
copy "backend\.env" "backend\.env.backup" >nul
echo ✅ Backup created: backend\.env.backup
echo.

REM Note: This simple version doesn't do URL encoding
REM For passwords with special characters, use the PowerShell version instead
echo ⚠️  NOTE: If your password contains special characters (@, :, /, ?, #, [, ])
echo    please use the PowerShell version: .\setup-mongodb-password.ps1
echo.

REM Update .env file using PowerShell for better string handling
powershell -Command "(Get-Content 'backend\.env') -replace '<db_password>', '%DB_PASSWORD%' | Set-Content 'backend\.env'"

echo ✅ Password updated in backend\.env
echo.

REM Test connection
echo 🧪 Testing MongoDB connection...
echo.

cd backend
node test-new-mongodb-connection.js
set TEST_RESULT=%errorlevel%
cd ..

if %TEST_RESULT% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════════════════
    echo ✅ SUCCESS! MongoDB connection is working!
    echo ═══════════════════════════════════════════════════════════════════════════
    echo.
    echo 🚀 You can now start the iSafari system:
    echo.
    echo    Option 1: Start everything together
    echo    .\start-with-new-mongodb.bat
    echo.
    echo    Option 2: Start separately
    echo    Terminal 1: cd backend ^&^& npm start
    echo    Terminal 2: npm run dev
    echo    Terminal 3: cd admin-portal ^&^& npm run dev
    echo.
) else (
    echo.
    echo ❌ MongoDB connection test failed!
    echo.
    echo 📝 Please check:
    echo 1. Password is correct
    echo 2. IP is whitelisted in MongoDB Atlas
    echo 3. MongoDB cluster is accessible
    echo.
    echo 💡 You can restore the backup with:
    echo    copy backend\.env.backup backend\.env
    echo.
    echo 💡 For passwords with special characters, use PowerShell version:
    echo    .\setup-mongodb-password.ps1
    echo.
)

echo ═══════════════════════════════════════════════════════════════════════════
echo.
pause
