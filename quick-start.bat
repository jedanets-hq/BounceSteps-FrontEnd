@echo off
title MUST LMS - Quick Start
color 0A

echo.
echo  ███╗   ███╗██╗   ██╗███████╗████████╗    ██╗     ███╗   ███╗███████╗
echo  ████╗ ████║██║   ██║██╔════╝╚══██╔══╝    ██║     ████╗ ████║██╔════╝
echo  ██╔████╔██║██║   ██║███████╗   ██║       ██║     ██╔████╔██║███████╗
echo  ██║╚██╔╝██║██║   ██║╚════██║   ██║       ██║     ██║╚██╔╝██║╚════██║
echo  ██║ ╚═╝ ██║╚██████╔╝███████║   ██║       ███████╗██║ ╚═╝ ██║███████║
echo  ╚═╝     ╚═╝ ╚═════╝ ╚══════╝   ╚═╝       ╚══════╝╚═╝     ╚═╝╚══════╝
echo.
echo                    MBEYA UNIVERSITY OF SCIENCE AND TECHNOLOGY
echo                           Learning Management System
echo.
echo ================================================================================
echo                          STARTING ALL THREE SYSTEMS
echo ================================================================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    echo Please ensure Node.js is properly installed.
    pause
    exit /b 1
)

echo [INFO] Node.js and npm are available
echo.

REM Install dependencies for all systems
echo [STEP 1/4] Installing dependencies...
echo.

echo   Cleaning npm cache...
call npm cache clean --force >nul 2>&1

echo   Installing Lecture System dependencies...
cd lecture-system
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1
call npm install --no-optional --legacy-peer-deps
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with different flags...
    call npm install --force --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo   [ERROR] Failed to install lecture system dependencies!
        echo   Please try running: cd lecture-system && npm install manually
        cd ..
        pause
        exit /b 1
    )
)
echo   ✓ Lecture System dependencies installed
cd ..

echo   Installing Student System dependencies...
cd student-system
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1
call npm install --no-optional --legacy-peer-deps
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with different flags...
    call npm install --force --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo   [ERROR] Failed to install student system dependencies!
        echo   Please try running: cd student-system && npm install manually
        cd ..
        pause
        exit /b 1
    )
)
echo   ✓ Student System dependencies installed
cd ..

echo   Installing Admin System dependencies...
cd admin-system
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1
call npm install --no-optional --legacy-peer-deps
if %errorlevel% neq 0 (
    echo   [WARNING] Retrying with different flags...
    call npm install --force --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo   [ERROR] Failed to install admin system dependencies!
        echo   Please try running: cd admin-system && npm install manually
        cd ..
        pause
        exit /b 1
    )
)
echo   ✓ Admin System dependencies installed
cd ..

echo.
echo [STEP 2/4] Starting development servers...
echo.

REM Start all three systems
echo   Starting Lecture System (Port 3000)...
start "MUST LMS - Lecture System (Port 3000)" cmd /c "cd /d %~dp0\lecture-system && npm run dev"

timeout /t 4 /nobreak >nul

echo   Starting Student System (Port 3001)...
start "MUST LMS - Student System (Port 3001)" cmd /c "cd /d %~dp0\student-system && npm run dev"

timeout /t 4 /nobreak >nul

echo   Starting Admin System (Port 3002)...
start "MUST LMS - Admin System (Port 3002)" cmd /c "cd /d %~dp0\admin-system && npm run dev"

echo.
echo [STEP 3/4] Waiting for servers to initialize...
echo.

REM Wait for servers to start
echo   Please wait while all systems start up...
timeout /t 15 /nobreak >nul

echo.
echo [STEP 4/4] Opening web browsers...
echo.

REM Open browsers
echo   Opening Lecture System...
start "" "http://localhost:3000"
timeout /t 3 /nobreak >nul

echo   Opening Student System...
start "" "http://localhost:3001"  
timeout /t 3 /nobreak >nul

echo   Opening Admin System...
start "" "http://localhost:3002"

echo.
echo ================================================================================
echo                              ALL SYSTEMS RUNNING!
echo ================================================================================
echo.
echo   🎓 Lecture System:  http://localhost:3000  (Instructor Portal)
echo   📚 Student System:  http://localhost:3001  (Student Portal)  
echo   ⚙️  Admin System:    http://localhost:3002  (Administrator Portal)
echo.
echo ================================================================================
echo.
echo Press any key to STOP all systems and exit...
pause >nul

echo.
echo Shutting down all systems...
taskkill /f /im node.exe >nul 2>&1
echo All systems stopped successfully.
echo.
echo Thank you for using MUST LMS!
timeout /t 3 /nobreak >nul
