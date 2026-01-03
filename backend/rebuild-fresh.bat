@echo off
echo ========================================
echo  REBUILDING FRESH - Mabadiliko Mapya
echo ========================================
echo.

echo [1/4] Deleting old dist folder...
if exist dist (
    rmdir /s /q dist
    echo ✓ Old dist deleted
) else (
    echo ✓ No old dist found
)
echo.

echo [2/4] Clearing node cache...
npm cache clean --force
echo ✓ Cache cleared
echo.

echo [3/4] Building fresh code...
npm run build
echo ✓ Build complete
echo.

echo [4/4] Checking dist folder...
if exist dist (
    echo ✓ New dist folder created successfully!
    dir dist
) else (
    echo ✗ ERROR: dist folder not created!
    pause
    exit /b 1
)
echo.

echo ========================================
echo  ✅ REBUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Test locally: npm run preview
echo 2. Deploy to production
echo 3. Clear browser cache (Ctrl+Shift+Delete)
echo.
pause
