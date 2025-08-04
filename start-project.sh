#!/bin/bash
# TigerRozetka - Универсальный запуск всего проекта
# Запускает: Telegram Bot (aiogram) + Backend API + Frontend Dev Server

echo "🐅⚡ Запуск TigerRozetka Project..."
echo "=================================="

# Проверяем наличие необходимых файлов
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    exit 1
fi

if [ ! -f "telegram_bot_aiogram.py" ]; then
    echo "❌ telegram_bot_aiogram.py не найден!"
    exit 1
fi

# Функция для остановки всех процессов при выходе
cleanup() {
    echo ""
    echo "🛑 Остановка всех сервисов..."
    kill $BOT_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Все сервисы остановлены"
    exit 0
}

# Устанавливаем обработчик сигналов
trap cleanup SIGINT SIGTERM

echo "📦 1/4 Проверка зависимостей..."

# Проверяем Python зависимости
python -c "import aiogram" 2>/dev/null || {
    echo "⚡ Устанавливаем Python зависимости..."
    pip install aiogram aiohttp python-dotenv sqlite3
}

# Проверяем Node.js зависимости для backend
if [ ! -d "backend/node_modules" ]; then
    echo "⚡ Устанавливаем Backend зависимости..."
    cd backend && npm install && cd ..
fi

# Проверяем Node.js зависимости для frontend
if [ ! -d "node_modules" ]; then
    echo "⚡ Устанавливаем Frontend зависимости..."
    npm install
fi

echo "🤖 2/4 Запуск Telegram Bot (aiogram)..."
python telegram_bot_aiogram.py &
BOT_PID=$!
sleep 2

echo "🔧 3/4 Запуск Backend API (Express)..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..
sleep 3

echo "🎮 4/4 Запуск Frontend Dev Server (Vite)..."
npm run dev &
FRONTEND_PID=$!
sleep 2

echo ""
echo "🎉 TigerRozetka запущен успешно!"
echo "=================================="
echo "🤖 Telegram Bot: @tigerrosette_bot"
echo "🔧 Backend API:  http://localhost:3001"
echo "🎮 Frontend:     http://localhost:5173"
echo "📱 Game URL:     https://orspiritus.github.io/tigerrosette/"
echo ""
echo "💡 Команды бота: /start, /duel, /stats, /play"
echo "⚡ Нажмите Ctrl+C для остановки всех сервисов"
echo ""

# Ожидаем завершения
wait
