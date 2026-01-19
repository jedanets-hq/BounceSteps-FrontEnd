@echo off
echo ========================================
echo Building iSafari Admin Portal
echo ========================================
echo.

cd admin-portal

echo Installing dependencies...
call npm install

echo.
echo Building for production...
call npm run build

echo.
echo ========================================
echo Build complete!
echo Dist folder: admin-portal/dist
echo ========================================
echo.
echo You can now deploy the dist folder to:
echo - Netlify
echo - Vercel
echo - Traditional web hosting
echo ========================================

pause
