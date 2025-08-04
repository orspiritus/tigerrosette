# 🐅⚡ TigerRozetka - Универсальный запуск проекта

## 🚀 Одна команда для запуска всего проекта!

### 💡 Что запускается:
- 🤖 **Telegram Bot** (aiogram) - система дуэлей и уведомлений
- 🔧 **Backend API** (Express + TypeScript) - обработка данных
- 🎮 **Frontend Dev Server** (Vite + React) - игровой интерфейс

---

## 🎯 Быстрый запуск

### 🪟 **Windows (рекомендуется)**
```bash
# Просто двойной клик по файлу:
start-project.bat

# Или из командной строки:
npm run start-all
```

### 🐧 **Linux/macOS**
```bash
# Сделать исполняемым и запустить:
chmod +x start-project.sh
./start-project.sh

# Или через npm:
npm run start-project
```

### 🌐 **Кроссплатформенно (Node.js)**
```bash
npm run start-project
```

---

## 📋 Варианты запуска

### 1. **Batch файл (Windows)** 
```bash
start-project.bat
```
- ✅ Простейший способ
- ✅ Открывает отдельные окна
- ✅ Автоустановка зависимостей

### 2. **PowerShell скрипт (Windows)**
```powershell
./start-project.ps1
```
- ✅ Продвинутое управление
- ✅ Цветной вывод
- ✅ Мониторинг процессов

### 3. **Bash скрипт (Linux/macOS)**
```bash
./start-project.sh
```
- ✅ Unix-совместимый
- ✅ Автоматическая очистка
- ✅ Проверка зависимостей

### 4. **NPM скрипты**
```bash
# Параллельный запуск
npm run start-all

# Node.js скрипт
npm run start-project
```

---

## 🎮 После запуска

### ✅ Что будет доступно:

| Сервис | URL | Описание |
|--------|-----|----------|
| 🤖 **Telegram Bot** | @tigerrosette_bot | Команды: `/start`, `/duel`, `/stats` |
| 🔧 **Backend API** | http://localhost:3001 | REST API для дуэлей |
| 🎮 **Frontend** | http://localhost:5173 | Локальная разработка |
| 📱 **Production Game** | https://orspiritus.github.io/tigerrosette/ | Живая игра |

### 🎯 Команды бота:
- `/start` - Приветствие с кнопкой игры
- `/duel` - Найти соперника для дуэли
- `/stats` - Показать статистику
- `/play` - Прямой запуск игры

---

## 🔧 Что происходит автоматически

### 📦 **Установка зависимостей:**
1. Python: `aiogram`, `aiohttp`, `python-dotenv`
2. Backend: `express`, `typescript`, `sqlite3`
3. Frontend: `react`, `vite`, `framer-motion`

### 🗄️ **Инициализация базы данных:**
- SQLite база `bot_users.db`
- Таблицы пользователей и дуэлей
- Автоочистка истекших приглашений

### 🌐 **Запуск сервисов:**
- Bot polling на Telegram API
- Backend сервер на порту 3001
- Frontend dev server на порту 5173

---

## 🛑 Остановка проекта

### Windows:
- **Batch**: Закрыть все открытые окна
- **PowerShell**: `Ctrl+C`

### Linux/macOS:
- **Bash**: `Ctrl+C`

### NPM:
- **Любая платформа**: `Ctrl+C`

---

## 🚨 Требования

### 💻 **Системные:**
- **Python 3.8+** с pip
- **Node.js 18+** с npm
- **Git** (для клонирования)

### 🔑 **Переменные окружения (.env):**
```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_BOT_USERNAME=tigerrosette_bot
VITE_APP_URL=https://orspiritus.github.io/tigerrosette/
```

---

## 🎊 Готово!

После запуска любой из команд весь проект TigerRozetka будет работать в полном объеме:
- ✅ Telegram бот принимает команды
- ✅ Система дуэлей между реальными игроками  
- ✅ WebApp интеграция
- ✅ Real-time уведомления
- ✅ Статистика и рейтинги

**Протестируйте:** Напишите `/start` боту @tigerrosette_bot 🚀
