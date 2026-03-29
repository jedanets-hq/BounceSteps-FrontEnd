@echo off
echo 🔄 Restarting Frontend Dev Server...
echo.
echo 📋 Steps:
echo    1. Clearing node_modules cache
echo    2. Starting Vite dev server
echo.

cd /d "%~dp0"

echo 🧹 Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

echo.
echo 🚀 Starting frontend dev server...
echo    Backend: http://localhost:5000
echo    Frontend will be at: http://localhost:5173
echo.
echo ⚠️  After server starts:
echo    1. Clear browser cache (Ctrl+Shift+Delete)
echo    2. Hard refresh (Ctrl+F5)
echo    3. Check console for errors
echo.

npm run dev
