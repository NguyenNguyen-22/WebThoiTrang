@echo off
title SmartFit AI Size Service
echo ========================================================
echo        SMARTFIT AI SIZE ESTIMATOR BACKEND SERVICE
echo ========================================================
echo.
cd /d "%~dp0"

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b
)

:: Create virtual environment if it doesn't exist
if not exist .venv (
    echo [INFO] Creating Python virtual environment in .venv...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b
    )
)

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate

:: Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip >nul

:: Install dependencies
echo [INFO] Installing required libraries from requirements.txt...
echo This may take a moment on the first run (especially CatBoost)...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b
)

echo.
echo [SUCCESS] Backend environment is ready!
echo [INFO] Starting FastAPI server on http://localhost:5000
echo Press Ctrl+C to stop the server.
echo.
uvicorn app:app --host 127.0.0.1 --port 5000 --reload
pause
