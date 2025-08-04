@echo off
REM TigerRozetka - Universal project launcher (Windows Batch)
REM Starts: Telegram Bot + Backend API + Frontend Dev Server

echo 🐅⚡ Starting TigerRozetka Project...
echo ==================================

REM Check for required files
if not exist ".env" (
    echo ❌ .env file not found!
    pause
    exit /b 1
)

if not exist "telegram_bot_aiogram.py" (
    echo ❌ telegram_bot_aiogram.py not found!
    pause
    exit /b 1
)

echo 📦 1/4 Checking dependencies...

REM Check Python dependencies
python -c "import aiogram" 2>nul
if errorlevel 1 (
    echo ⚡ Installing Python dependencies...
    pip install aiogram aiohttp python-dotenv
)

REM Check Backend dependencies
if not exist "backend\node_modules" (
    echo ⚡ Installing Backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check Frontend dependencies
if not exist "node_modules" (
    echo ⚡ Installing Frontend dependencies...
    call npm install
)

echo 🤖 2/4 Starting Telegram Bot (aiogram)...
start "TigerRozetka Bot" cmd /k "python telegram_bot_aiogram.py"
timeout /t 2 /nobreak >nul

echo 🔧 3/4 Starting Backend API (Express)...
start "TigerRozetka Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo 🎮 4/4 Starting Frontend Dev Server (Vite)...
start "TigerRozetka Frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo 🎉 TigerRozetka started successfully!
echo ==================================
echo 🤖 Telegram Bot: @tigerrosette_bot
echo 🔧 Backend API:  http://localhost:3001
echo 🎮 Frontend:     http://localhost:5173
echo 📱 Game URL:     https://orspiritus.github.io/tigerrosette/
echo.
echo 💡 Bot commands: /start, /duel, /stats, /play
echo ⚡ Close all windows to stop services
echo.
echo Press any key to exit...
pause >nul
