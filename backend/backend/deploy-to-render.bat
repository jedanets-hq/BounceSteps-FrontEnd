@echo off
REM iSafari Backend - Render Deployment Script (Windows)
REM This script prepares and deploys backend to Render

echo.
echo ========================================
echo iSafari Backend - Render Deployment
echo ========================================
echo.

REM Step 1: Add all changes
echo Step 1: Adding all changes to Git...
git add .

REM Step 2: Commit changes
echo Step 2: Committing changes...
git commit -m "Add admin routes for admin portal - Render deployment"

REM Step 3: Check if remote exists
echo Step 3: Checking Git remote...
git remote | findstr "origin" >nul
if %errorlevel% equ 0 (
    echo Remote 'origin' exists
    
    REM Step 4: Push to GitHub
    echo Step 4: Pushing to GitHub...
    git push origin main
    if %errorlevel% neq 0 (
        git push origin master
    )
    
    echo.
    echo ========================================
    echo SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo NEXT STEPS:
    echo 1. Go to Render Dashboard: https://dashboard.render.com
    echo 2. Your backend service should auto-deploy (if enabled)
    echo 3. Wait 2-5 minutes for deployment to complete
    echo 4. Verify: https://backend-bncb.onrender.com/api/health
    echo.
) else (
    echo.
    echo ========================================
    echo WARNING: No Git remote found!
    echo ========================================
    echo.
    echo MANUAL DEPLOYMENT OPTIONS:
    echo.
    echo OPTION 1: Connect to GitHub
    echo   1. Create GitHub repository
    echo   2. Run: git remote add origin [your-repo-url]
    echo   3. Run: git push -u origin main
    echo   4. Connect Render to GitHub repo
    echo.
    echo OPTION 2: Manual Deploy on Render
    echo   1. Go to: https://dashboard.render.com
    echo   2. Click your backend service
    echo   3. Click 'Manual Deploy' button
    echo.
)

echo.
echo ========================================
echo Deployment preparation complete!
echo ========================================
echo.
pause
