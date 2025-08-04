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
                try {
                    exec(`taskkill /pid ${proc.pid} /t /f`);
                } catch (e) {
                    // Игнорируем ошибки при завершении процессов
                }
            } else {
                try {
                    proc.kill('SIGTERM');
                } catch (e) {
                    // Игнорируем ошибки при завершении процессов
                }
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
        try {
            await execPromise('pip install aiogram aiohttp python-dotenv');
        } catch (error) {
            console.error('❌ Ошибка установки Python зависимостей:', error.message);
        }
    }
    
    // Проверяем Backend зависимости
    if (!fs.existsSync('backend/node_modules')) {
        console.log('⚡ Устанавливаем Backend зависимости...');
        try {
            await execPromise('npm install', { cwd: 'backend' });
        } catch (error) {
            console.error('❌ Ошибка установки Backend зависимостей:', error.message);
        }
    }
    
    // Проверяем Frontend зависимости
    if (!fs.existsSync('node_modules')) {
        console.log('⚡ Устанавливаем Frontend зависимости...');
        try {
            await execPromise('npm install');
        } catch (error) {
            console.error('❌ Ошибка установки Frontend зависимостей:', error.message);
        }
    }
}

function execPromise(command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`${error.message}\nstdout: ${stdout}\nstderr: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

function spawnProcess(command, args, options = {}) {
    const proc = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWindows,
        detached: !isWindows,
        ...options
    });
    
    proc.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`[${options.name || 'Process'}] ${output}`);
        }
    });
    
    proc.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('DeprecationWarning')) {
            console.error(`[${options.name || 'Process'}] ${output}`);
        }
    });
    
    proc.on('exit', (code, signal) => {
        if (code !== 0 && code !== null) {
            console.error(`❌ ${options.name || 'Process'} завершился с кодом ${code}`);
        }
    });
    
    proc.on('error', (error) => {
        console.error(`❌ Ошибка запуска ${options.name || 'Process'}:`, error.message);
    });
    
    processes.push(proc);
    return proc;
}

async function startServices() {
    try {
        await checkDependencies();
        
        console.log('🤖 2/4 Запуск Telegram Bot (aiogram)...');
        spawnProcess('python', ['telegram_bot_aiogram.py'], { name: 'TelegramBot' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔧 3/4 Запуск Backend API (Express)...');
        spawnProcess(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], { 
            name: 'Backend', 
            cwd: path.resolve('backend') 
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🎮 4/4 Запуск Frontend Dev Server (Vite)...');
        spawnProcess(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], { name: 'Frontend' });
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
        setInterval(() => {
            // Проверяем, что процессы все еще работают
            const activeProcesses = processes.filter(p => !p.killed && p.pid);
            if (activeProcesses.length === 0) {
                console.log('⚠️  Все процессы завершились');
                cleanup();
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ Ошибка при запуске сервисов:', error.message);
        cleanup();
    }
}

if (require.main === module) {
    startServices();
}
