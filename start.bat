@echo off
cd /d "%~dp0"
echo ============================================
echo  Hotel Evaluation DSS - DS/ER ^& BRB System
echo ============================================
echo.
echo Installing dependencies...
pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b %errorlevel%
)
echo.
echo Starting Flask server...
echo Open http://127.0.0.1:5000 in your browser
echo.
python backend\app.py
pause
