@echo off
echo ========================================================
echo        STOPPING ALL SERVICES FOR FASHION WEBSITE
echo ========================================================
echo.

echo Stopping Frontend on Port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Stopping Backend on Port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Stopping AI Estimator on Port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ========================================================
echo All services have been stopped!
echo ========================================================
echo.
pause
