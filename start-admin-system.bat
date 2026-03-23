@echo off
echo ========================================
echo Starting iSafari Admin System
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo [2/3] Starting Admin Portal...
start "Admin Portal" cmd /k "cd admin-portal && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Main Frontend...
start "Main Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo All systems started!
echo ========================================
echo Backend:      http://localhost:5000
echo Admin Portal: http://localhost:5176
echo Frontend:     http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause > nul
