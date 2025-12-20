@echo off
echo Starting iSafari Global Website...
echo.

REM Change to the project directory
cd /d "c:\Users\Joctan_Elvin\Desktop\isafari_global (1)\isafari_global"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

REM Start the development server
echo Starting development server...
echo Your website will open automatically in your browser.
echo Press Ctrl+C to stop the server when you're done.
echo.
npm start

pause
