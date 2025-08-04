@echo off
REM TigerRozetka - Универсальный запуск всего проекта (Windows Batch)
REM Запускает: Telegram Bot + Backend API + Frontend Dev Server

echo 🐅⚡ Запуск TigerRozetka Project...
echo ==================================

REM Проверяем наличие файлов
if not exist ".env" (
    echo ❌ Файл .env не найден!
    pause
    exit /b 1
)

if not exist "telegram_bot_aiogram.py" (
    echo ❌ telegram_bot_aiogram.py не найден!
    pause
    exit /b 1
)

echo 📦 1/4 Проверка зависимостей...

REM Проверяем Python зависимости
python -c "import aiogram" 2>nul
if errorlevel 1 (
    echo ⚡ Устанавливаем Python зависимости...
    pip install aiogram aiohttp python-dotenv
)

REM Проверяем Backend зависимости
if not exist "backend\node_modules" (
    echo ⚡ Устанавливаем Backend зависимости...
    cd backend
    call npm install
    cd ..
)

REM Проверяем Frontend зависимости
if not exist "node_modules" (
    echo ⚡ Устанавливаем Frontend зависимости...
    call npm install
)

echo 🤖 2/4 Запуск Telegram Bot (aiogram)...
start "TigerRozetka Bot" cmd /k "python telegram_bot_aiogram.py"
timeout /t 2 /nobreak >nul

echo 🔧 3/4 Запуск Backend API (Express)...
start "TigerRozetka Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo 🎮 4/4 Запуск Frontend Dev Server (Vite)...
start "TigerRozetka Frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo 🎉 TigerRozetka запущен успешно!
echo ==================================
echo 🤖 Telegram Bot: @tigerrosette_bot
echo 🔧 Backend API:  http://localhost:3001
echo 🎮 Frontend:     http://localhost:5173
echo 📱 Game URL:     https://orspiritus.github.io/tigerrosette/
echo.
echo 💡 Команды бота: /start, /duel, /stats, /play
echo ⚡ Закройте все окна для остановки сервисов
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
