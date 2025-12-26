@echo off
echo ========================================
echo FRESH FRONTEND REBUILD AND DEPLOYMENT
echo ========================================
echo.

echo [STEP 1] Clearing old build files...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✓ Old build files cleared
echo.

echo [STEP 2] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [STEP 3] Building fresh production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo [STEP 4] Verifying build output...
if not exist dist\index.html (
    echo ❌ Build failed - dist/index.html not found!
    pause
    exit /b 1
)
echo ✓ Build output verified
echo.

echo [STEP 5] Copying _redirects file...
copy public\_redirects dist\_redirects /Y
echo ✓ _redirects copied
echo.

echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Deploy to Netlify using: netlify deploy --prod --dir=dist
echo 2. Or manually upload the 'dist' folder to Netlify
echo 3. Clear browser cache after deployment
echo.
echo Build location: %cd%\dist
echo.
pause
