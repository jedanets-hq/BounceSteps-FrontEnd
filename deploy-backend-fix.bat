@echo off
echo ========================================
echo 🚀 Deploying Backend Fix to Render
echo ========================================
echo.

echo 📝 Changes made:
echo   - Added better error handling in registration
echo   - Added database connection test on startup
echo   - Added JWT_SECRET validation
echo   - Added detailed error logging
echo.

echo 📦 Committing changes to Git...
cd backend
git add .
git commit -m "Fix: Add better error handling and diagnostics for registration endpoint"

echo.
echo 🚀 Pushing to Render...
git push origin main

echo.
echo ========================================
echo ✅ Deployment Complete!
echo ========================================
echo.
echo 📋 Next Steps:
echo   1. Wait 2-3 minutes for Render to rebuild
echo   2. Check Render logs for startup messages
echo   3. Look for:
echo      ✅ Database connection test successful
echo      ✅ JWT_SECRET is configured
echo   4. Run: node diagnose-backend-issue.js
echo.
echo 🔗 Render Dashboard:
echo    https://dashboard.render.com
echo.

pause
