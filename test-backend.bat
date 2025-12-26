@echo off
echo ========================================
echo TESTING RENDER BACKEND
echo ========================================
echo.
echo URL: https://isafarinetworkglobal-2.onrender.com/api/health
echo Timeout: 30 seconds
echo.
echo Testing...
echo.

curl -s -m 30 -w "HTTP Status: %%{http_code}\nTime: %%{time_total}s\n" https://isafarinetworkglobal-2.onrender.com/api/health

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Backend is working!
    echo ========================================
    echo.
    echo Providers should appear in Journey Planner Step 4
    echo.
) else (
    echo.
    echo ========================================
    echo FAILED! Backend is NOT working!
    echo ========================================
    echo.
    echo TATIZO: Backend ya Render haifanyi kazi
    echo.
    echo SULUHISHO:
    echo 1. Ingia https://dashboard.render.com
    echo 2. Chagua service: isafarinetworkglobal-2
    echo 3. Bonyeza 'Manual Deploy' ^> 'Clear build cache ^& deploy'
    echo 4. Weka DATABASE_URL kwenye Environment
    echo 5. Subiri 5-10 minutes
    echo 6. Run test-backend.bat tena
    echo.
)

pause
