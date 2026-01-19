@echo off
echo ========================================
echo Removing Admin Portal from Main App
echo ========================================
echo.

echo This will:
echo 1. Remove admin portal pages from src/pages/admin-portal
echo 2. Remove admin routes from main app
echo 3. Keep backend routes intact
echo.

set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Removing admin portal folder...
if exist "src\pages\admin-portal" (
    rmdir /s /q "src\pages\admin-portal"
    echo ✓ Admin portal folder removed
) else (
    echo ! Admin portal folder not found
)

echo.
echo ========================================
echo Admin portal removed from main app!
echo ========================================
echo.
echo Next steps:
echo 1. Update src/Routes.jsx to remove admin routes
echo 2. Build main app: npm run build
echo 3. Build admin portal: cd admin-portal ^&^& npm run build
echo ========================================

pause
