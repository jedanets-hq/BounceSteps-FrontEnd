@echo off
echo ========================================
echo Starting iSafari Admin Portal (Dev Mode)
echo ========================================
echo.

cd admin-portal

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server...
echo Admin Portal will open at: http://localhost:3001
echo.
echo Make sure backend is running at: http://localhost:5000
echo.

call npm run dev
