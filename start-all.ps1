# 🚀 Запуск всех сервисов TigerRozetka

Write-Host "🐅⚡ Запускаем TigerRozetka - все сервисы..." -ForegroundColor Yellow

# Проверяем наличие Node.js
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js не найден! Установите Node.js и попробуйте снова." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js найден: $(node --version)" -ForegroundColor Green

# Функция для запуска в фоне
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [int]$Port
    )
    
    Write-Host "🚀 Запускаем $Name..." -ForegroundColor Cyan
    
    if ($Path) {
        Set-Location $Path
    }
    
    # Проверяем, не занят ли порт
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "⚠️  Порт $Port уже занят. $Name возможно уже запущен." -ForegroundColor Yellow
            return
        }
    }
    catch {
        # Порт свободен, продолжаем
    }
    
    # Запускаем сервис
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $Command"
    Write-Host "✅ $Name запущен на порту $Port" -ForegroundColor Green
}

# Сохраняем текущую директорию
$originalPath = Get-Location

try {
    # Устанавливаем зависимости, если нужно
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Устанавливаем зависимости frontend..." -ForegroundColor Yellow
        npm install
    }
    
    if (!(Test-Path "backend/node_modules")) {
        Write-Host "📦 Устанавливаем зависимости backend..." -ForegroundColor Yellow
        Set-Location "backend"
        npm install
        Set-Location $originalPath
    }
    
    # Запускаем Backend (Node.js + Express + Socket.IO)
    Start-Service -Name "Backend API" -Path "backend" -Command "npm run dev" -Port 3001
    
    # Ждем немного для запуска backend
    Start-Sleep -Seconds 3
    
    # Запускаем Frontend (React + Vite)
    Start-Service -Name "Frontend" -Path $originalPath -Command "npm run dev" -Port 5173
    
    Write-Host ""
    Write-Host "🎉 Все сервисы запущены!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Доступ к игре:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173/" -ForegroundColor White
    Write-Host "   Backend:  http://localhost:3001/health" -ForegroundColor White
    Write-Host ""
    Write-Host "⚔️ Режим дуэлей полностью готов!" -ForegroundColor Yellow
    Write-Host "   1. Откройте http://localhost:5173/" -ForegroundColor White
    Write-Host "   2. Нажмите 'Дуэль'" -ForegroundColor White
    Write-Host "   3. Выберите соперника или играйте с ИИ" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Для Telegram Mini App используйте:" -ForegroundColor Cyan
    Write-Host "   https://orspiritus.github.io/tigerrosette/" -ForegroundColor White
    Write-Host ""
    Write-Host "Для остановки закройте окна PowerShell или нажмите Ctrl+C" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Ошибка при запуске: $_" -ForegroundColor Red
    Set-Location $originalPath
    exit 1
}
finally {
    Set-Location $originalPath
}
