@echo off
echo ========================================
echo Testing Admin Portal Setup
echo ========================================
echo.

echo Checking admin-portal folder...
if exist "admin-portal" (
    echo ✓ admin-portal folder exists
) else (
    echo ✗ admin-portal folder NOT found
    pause
    exit /b 1
)

echo.
echo Checking required files...

set files_ok=1

if exist "admin-portal\package.json" (
    echo ✓ package.json
) else (
    echo ✗ package.json NOT found
    set files_ok=0
)

if exist "admin-portal\vite.config.js" (
    echo ✓ vite.config.js
) else (
    echo ✗ vite.config.js NOT found
    set files_ok=0
)

if exist "admin-portal\index.html" (
    echo ✓ index.html
) else (
    echo ✗ index.html NOT found
    set files_ok=0
)

if exist "admin-portal\src\main.jsx" (
    echo ✓ src\main.jsx
) else (
    echo ✗ src\main.jsx NOT found
    set files_ok=0
)

if exist "admin-portal\src\pages\Login.jsx" (
    echo ✓ src\pages\Login.jsx
) else (
    echo ✗ src\pages\Login.jsx NOT found
    set files_ok=0
)

if exist "admin-portal\src\pages\Dashboard.jsx" (
    echo ✓ src\pages\Dashboard.jsx
) else (
    echo ✗ src\pages\Dashboard.jsx NOT found
    set files_ok=0
)

echo.
echo Checking components...

if exist "admin-portal\src\components\DashboardOverview.jsx" (
    echo ✓ DashboardOverview.jsx
) else (
    echo ✗ DashboardOverview.jsx NOT found
    set files_ok=0
)

if exist "admin-portal\src\components\UserManagement.jsx" (
    echo ✓ UserManagement.jsx
) else (
    echo ✗ UserManagement.jsx NOT found
    set files_ok=0
)

echo.
if %files_ok%==1 (
    echo ========================================
    echo ✓ All files present!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. cd admin-portal
    echo 2. npm install
    echo 3. npm run dev
    echo.
    echo Or use: start-admin-dev.bat
) else (
    echo ========================================
    echo ✗ Some files are missing!
    echo ========================================
    echo Please check the setup.
)

echo.
pause
