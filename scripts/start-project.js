#!/usr/bin/env node
/**
 * TigerRozetka - Универсальный запуск всего проекта
 * Кроссплатформенный Node.js скрипт
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('🐅⚡ Запуск TigerRozetka Project...');
console.log('==================================');

// Проверка файлов
const requiredFiles = ['.env', 'telegram_bot_aiogram.py'];
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Файл ${file} не найден!`);
        process.exit(1);
    }
}

let processes = [];

// Функция очистки процессов
function cleanup() {
    console.log('\n🛑 Остановка всех сервисов...');
    processes.forEach(proc => {
        if (proc && !proc.killed) {
            if (isWindows) {
                exec(`taskkill /pid ${proc.pid} /t /f`);
            } else {
                proc.kill('SIGTERM');
            }
        }
    });
    console.log('✅ Все сервисы остановлены');
    process.exit(0);
}

// Обработчики сигналов
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function checkDependencies() {
    console.log('📦 1/4 Проверка зависимостей...');
    
    // Проверяем Python зависимости
    try {
        await execPromise('python -c "import aiogram"');
        console.log('✅ Python зависимости найдены');
    } catch {
        console.log('⚡ Устанавливаем Python зависимости...');
        await execPromise('pip install aiogram aiohttp python-dotenv');
    }
    
    // Проверяем Backend зависимости
    if (!fs.existsSync('backend/node_modules')) {
        console.log('⚡ Устанавливаем Backend зависимости...');
        await execPromise('npm install', { cwd: 'backend' });
    }
    
    // Проверяем Frontend зависимости
    if (!fs.existsSync('node_modules')) {
        console.log('⚡ Устанавливаем Frontend зависимости...');
        await execPromise('npm install');
    }
}

function execPromise(command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function spawnProcess(command, args, options = {}) {
    const proc = spawn(command, args, {
        stdio: 'pipe',
        shell: isWindows,
        ...options
    });
    
    proc.stdout.on('data', (data) => {
        console.log(`[${options.name || 'Process'}] ${data.toString().trim()}`);
    });
    
    proc.stderr.on('data', (data) => {
        console.error(`[${options.name || 'Process'}] ${data.toString().trim()}`);
    });
    
    proc.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ ${options.name || 'Process'} завершился с кодом ${code}`);
        }
    });
    
    processes.push(proc);
    return proc;
}

async function startServices() {
    await checkDependencies();
    
    console.log('🤖 2/4 Запуск Telegram Bot (aiogram)...');
    spawnProcess('python', ['telegram_bot_aiogram.py'], { name: 'TelegramBot' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔧 3/4 Запуск Backend API (Express)...');
    spawnProcess('npm', ['run', 'dev'], { name: 'Backend', cwd: 'backend' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🎮 4/4 Запуск Frontend Dev Server (Vite)...');
    spawnProcess('npm', ['run', 'dev'], { name: 'Frontend' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n🎉 TigerRozetka запущен успешно!');
    console.log('==================================');
    console.log('🤖 Telegram Bot: @tigerrosette_bot');
    console.log('🔧 Backend API:  http://localhost:3001');
    console.log('🎮 Frontend:     http://localhost:5173');
    console.log('📱 Game URL:     https://orspiritus.github.io/tigerrosette/');
    console.log('');
    console.log('💡 Команды бота: /start, /duel, /stats, /play');
    console.log('⚡ Нажмите Ctrl+C для остановки всех сервисов');
    console.log('');
    
    // Держим процесс активным
    setInterval(() => {}, 1000);
}

startServices().catch(console.error);
