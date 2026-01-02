@echo off
echo ==========================================
echo Pushing Backend to GitHub...
echo ==========================================
echo.
echo 1. A login window will appear.
echo 2. Sign in with your browser or use a token.
echo.

cd /d "C:\Users\Joctan_Elvin\Desktop\isafari_global\isafari_global\backend"

REM Ensure remote is correct
git remote set-url origin https://github.com/Danny4312/Backend

REM Push
git push -u origin main

echo.
if %errorlevel% neq 0 (
    echo.
    echo ❌ PUSH FAILED!
    echo.
    echo Please try running this command manually in terminal:
    echo git push -u origin main
    echo.
) else (
    echo.
    echo ✅ SUCCESS! Backend pushed to GitHub.
    echo.
)
pause
