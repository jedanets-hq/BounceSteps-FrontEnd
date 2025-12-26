@echo off
echo ========================================
echo TESTING RENDER BACKEND - DETAILED
echo ========================================
echo.
echo Testing health endpoint...
curl -v -m 30 https://isafarinetworkglobal-2.onrender.com/api/health
echo.
echo.
echo ========================================
echo Testing services endpoint...
curl -v -m 30 https://isafarinetworkglobal-2.onrender.com/api/services?limit=3
echo.
pause
