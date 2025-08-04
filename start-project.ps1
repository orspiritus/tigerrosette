# TigerRozetka - Универсальный запуск всего проекта (Windows PowerShell)
# Запускает: Telegram Bot (aiogram) + Backend API + Frontend Dev Server

Write-Host "🐅⚡ Запуск TigerRozetka Project..." -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Проверяем наличие необходимых файлов
if (-not (Test-Path ".env")) {
    Write-Host "❌ Файл .env не найден!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "telegram_bot_aiogram.py")) {
    Write-Host "❌ telegram_bot_aiogram.py не найден!" -ForegroundColor Red
    exit 1
}

# Функция для остановки всех процессов
function Stop-AllProcesses {
    Write-Host ""
    Write-Host "🛑 Остановка всех сервисов..." -ForegroundColor Yellow
    
    # Останавливаем Python процессы (боты)
    Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "python"} | Stop-Process -Force
    
    # Останавливаем Node процессы
    Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
    
    Write-Host "✅ Все сервисы остановлены" -ForegroundColor Green
    exit 0
}

# Обработчик Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action { Stop-AllProcesses }

Write-Host "📦 1/4 Проверка зависимостей..." -ForegroundColor Cyan

# Проверяем Python зависимости
try {
    python -c "import aiogram" 2>$null
    Write-Host "✅ Python зависимости найдены" -ForegroundColor Green
} catch {
    Write-Host "⚡ Устанавливаем Python зависимости..." -ForegroundColor Yellow
    pip install aiogram aiohttp python-dotenv
}

# Проверяем Node.js зависимости для backend
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "⚡ Устанавливаем Backend зависимости..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Проверяем Node.js зависимости для frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "⚡ Устанавливаем Frontend зависимости..." -ForegroundColor Yellow
    npm install
}

Write-Host "🤖 2/4 Запуск Telegram Bot (aiogram)..." -ForegroundColor Cyan
$botJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    python telegram_bot_aiogram.py 
}
Start-Sleep 2

Write-Host "🔧 3/4 Запуск Backend API (Express)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock { 
    Set-Location "$using:PWD\backend"
    npm run dev 
}
Start-Sleep 3

Write-Host "🎮 4/4 Запуск Frontend Dev Server (Vite)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm run dev 
}
Start-Sleep 2

Write-Host ""
Write-Host "🎉 TigerRozetka запущен успешно!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "🤖 Telegram Bot: @tigerrosette_bot" -ForegroundColor White
Write-Host "🔧 Backend API:  http://localhost:3001" -ForegroundColor White
Write-Host "🎮 Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "📱 Game URL:     https://orspiritus.github.io/tigerrosette/" -ForegroundColor White
Write-Host ""
Write-Host "💡 Команды бота: /start, /duel, /stats, /play" -ForegroundColor Cyan
Write-Host "⚡ Нажмите Ctrl+C для остановки всех сервисов" -ForegroundColor Yellow
Write-Host ""

# Мониторинг статуса jobs
try {
    while ($true) {
        # Проверяем статус jobs
        $botStatus = Get-Job $botJob.Id | Select-Object -ExpandProperty State
        $backendStatus = Get-Job $backendJob.Id | Select-Object -ExpandProperty State
        $frontendStatus = Get-Job $frontendJob.Id | Select-Object -ExpandProperty State
        
        if ($botStatus -eq "Failed" -or $backendStatus -eq "Failed" -or $frontendStatus -eq "Failed") {
            Write-Host "❌ Один из сервисов упал!" -ForegroundColor Red
            break
        }
        
        Start-Sleep 5
    }
} finally {
    Stop-AllProcesses
}
