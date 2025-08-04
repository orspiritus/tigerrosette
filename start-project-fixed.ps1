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

# Обработчик сигнала прерывания (Ctrl+C)
$null = Register-EngineEvent PowerShell.Exiting -Action { Stop-AllProcesses }

# Установка зависимостей Python
Write-Host "📦 Проверка зависимостей Python..." -ForegroundColor Cyan
pip install aiogram aiohttp python-dotenv

# Установка зависимостей Node.js для frontend
Write-Host "📦 Frontend зависимости..." -ForegroundColor Cyan
npm install

# Установка зависимостей для backend
Write-Host "📦 Backend зависимости..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

# Запуск всех сервисов в фоновом режиме
Write-Host ""
Write-Host "🚀 Запуск всех сервисов..." -ForegroundColor Green
Write-Host ""

# 1. Запускаем Telegram Bot (aiogram)
Write-Host "🤖 Запуск Telegram Bot..." -ForegroundColor Yellow
$botJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    python telegram_bot_aiogram.py
}

# 2. Запускаем Backend API
Write-Host "🔗 Запуск Backend API..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD/backend"
    npm run dev
}

# 3. Запускаем Frontend Dev Server
Write-Host "🌐 Запуск Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Ждем немного для запуска всех сервисов
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Все сервисы запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Сервисы:" -ForegroundColor White
Write-Host "🤖 Telegram Bot: ✅ Активен" -ForegroundColor Green
Write-Host "🔗 Backend API:  http://localhost:3001" -ForegroundColor White
Write-Host "🌐 Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "📱 Game URL:     https://orspiritus.github.io/tigerrosette/" -ForegroundColor White
Write-Host ""
Write-Host "💡 Нажмите Ctrl+C для остановки всех сервисов" -ForegroundColor Yellow
Write-Host ""

# Мониторинг статуса сервисов
while ($true) {
    try {
        # Проверяем статус всех Job'ов
        $botStatus = Get-Job $botJob.Id | Select-Object -ExpandProperty State
        $backendStatus = Get-Job $backendJob.Id | Select-Object -ExpandProperty State
        $frontendStatus = Get-Job $frontendJob.Id | Select-Object -ExpandProperty State
        
        # Если какой-то сервис упал, показываем ошибку
        if ($botStatus -eq "Failed") {
            Write-Host "❌ Telegram Bot завершился с ошибкой!" -ForegroundColor Red
            Receive-Job $botJob.Id -ErrorAction SilentlyContinue
        }
        
        if ($backendStatus -eq "Failed") {
            Write-Host "❌ Backend API завершился с ошибкой!" -ForegroundColor Red
            Receive-Job $backendJob.Id -ErrorAction SilentlyContinue
        }
        
        if ($frontendStatus -eq "Failed") {
            Write-Host "❌ Frontend завершился с ошибкой!" -ForegroundColor Red
            Receive-Job $frontendJob.Id -ErrorAction SilentlyContinue
        }
        
        Start-Sleep -Seconds 10
        
    } catch {
        Write-Host "⚠️ Ошибка мониторинга: $($_.Exception.Message)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}
