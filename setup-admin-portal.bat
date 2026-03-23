@echo off
echo ========================================
echo iSafari Admin Portal Setup
echo ========================================
echo.

echo Step 1: Creating admin database tables...
psql -U postgres -d isafari_db -f backend/migrations/create_admin_tables.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create admin tables
    echo Make sure PostgreSQL is running and isafari_db exists
    pause
    exit /b 1
)
echo ✓ Admin tables created successfully
echo.

echo Step 2: Installing admin portal dependencies...
cd admin-portal
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 3: Creating .env file...
if not exist .env (
    copy .env.example .env
    echo ✓ .env file created
) else (
    echo .env file already exists
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Default Admin Credentials:
echo Email: admin@isafari.com
echo Password: Admin@123
echo.
echo To start the admin portal:
echo   cd admin-portal
echo   npm run dev
echo.
echo Admin portal will run on: http://localhost:5176
echo.
pause
