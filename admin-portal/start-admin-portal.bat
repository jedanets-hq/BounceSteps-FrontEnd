@echo off
echo ========================================
echo iSafari Admin Portal - Starting System
echo ========================================
echo.

:: Check if backend directory exists
if not exist "..\backend" (
    echo ERROR: Backend directory not found!
    echo Please make sure you're running this from the admin-portal directory
    pause
    exit /b 1
)

:: Start backend in a new window
echo [1/2] Starting iSafari Backend...
start "iSafari Backend" cmd /k "cd ..\backend && npm start"

:: Wait a bit for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start admin portal with http-server
echo.
echo [2/2] Starting Admin Portal...
echo.
echo Checking for http-server...

:: Check if http-server is installed
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npx not found. Please install Node.js
    pause
    exit /b 1
)

echo Starting admin portal on http://localhost:8080
echo.
start "iSafari Admin Portal" cmd /k "npx http-server -p 8080 -o"

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo.
echo Backend:       http://localhost:5000
echo Admin Portal:  http://localhost:8080
echo.
echo Press any key to open admin portal in browser...
pause >nul

:: Open admin portal in default browser
start http://localhost:8080

echo.
echo Both services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
