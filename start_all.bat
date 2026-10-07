@echo off
echo ========================================================
echo        STARTING ALL SERVICES FOR FASHION WEBSITE
echo ========================================================
echo.

echo [1/3] Starting AI Estimator (FastAPI on Port 5000)...
start "AI Estimator - FastAPI" cmd /c "cd /d "%~dp0ai-estimator" && call start.bat"

echo [2/3] Starting Backend (Spring Boot on Port 8080)...
start "Spring Boot Backend" cmd /c "cd /d "%~dp0BE-UI1" && gradlew.bat bootRun"

echo [3/3] Starting Frontend (Vite React on Port 5173)...
start "Vite Frontend - React" cmd /c "cd /d "%~dp0UI1\bn-store" && npm run dev"

echo.
echo ========================================================
echo All services have been launched in separate windows!
echo - Frontend (HTTPS): https://localhost:5173
echo - Backend (API): http://localhost:8080/identity
echo - AI Estimator: http://localhost:5000
echo ========================================================
echo.
pause
