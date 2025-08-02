# Руководство по подключению вибрации и Telegram Bot

## 🎮 Система вибрации в TigerRozetka

### Возможности вибрации

Игра поддерживает полную систему тактильной обратной связи через Telegram Mini App API:

#### 🎯 Игровые события с вибрацией:
- **Нажатие на розетку** - средняя вибрация
- **Успешное выживание** - приятная вибрация успеха
- **Удар током** - мощная двойная вибрация
- **Повышение уровня** - серия из 3-х вибраций
- **Серии достижений** - прогрессивная вибрация (5, 10, 25 подряд)
- **Получение награды** - легкая + средняя вибрация
- **Кнопки меню** - легкая тактильная обратная связь

#### 🔧 Настройки вибрации:
- Включение/выключение вибрации
- Тест всех типов вибрации
- Автоматическое сохранение настроек
- Проверка поддержки устройством

### 📱 Поддерживаемые устройства

Вибрация работает на:
- **iOS** (iPhone/iPad) в Telegram Mini App
- **Android** смартфоны в Telegram Mini App
- **Веб-версия** с поддержкой Navigator.vibrate API

---

## 🤖 Создание и настройка Telegram Bot

### Шаг 1: Создание бота через BotFather

1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Выберите имя бота: `TigerRozetka Bot`
4. Выберите username: `@tigerrozetka_bot` (или доступный)
5. Сохраните токен бота (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Шаг 2: Настройка Mini App

1. Отправьте команду `/mybots` в BotFather
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Выберите "Configure Menu Button"
5. Установите:
   - **Text**: `🎮 Играть`
   - **URL**: `https://your-app-domain.com` (ваш домен)

### Шаг 3: Настройка Web App

1. В BotFather выберите "Web App" 
2. Установите URL вашего приложения
3. Добавьте описание: "Опасная игра с электричеством"

### Шаг 4: Конфигурация в коде

Создайте файл `.env` в корне проекта:

```env
# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_BOT_USERNAME=tigerrozetka_bot
VITE_APP_URL=https://your-domain.com

# Game Configuration
VITE_ENABLE_HAPTICS=true
VITE_DEBUG_MODE=false
```

---

## 🚀 Интеграция с Telegram API

### Обновление App.tsx для Telegram

```typescript
// src/App.tsx
import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

function App() {
  useEffect(() => {
    // Инициализация Telegram Web App
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
      
      // Настройка главной кнопки
      WebApp.MainButton.text = "Начать игру";
      WebApp.MainButton.show();
      
      // Настройка цветовой схемы
      WebApp.setHeaderColor('#FF6B35');
      WebApp.setBackgroundColor('#1A1A1A');
      
      // Обработка закрытия приложения
      WebApp.onEvent('mainButtonClicked', () => {
        // Логика начала игры
      });
      
      // Включение подтверждения закрытия
      WebApp.enableClosingConfirmation();
    }
  }, []);

  return (
    <div className="App">
      {/* Ваш игровой контент */}
    </div>
  );
}
```

### Установка дополнительных пакетов

```bash
npm install @twa-dev/sdk
npm install @telegram-apps/sdk
```

---

## 🔧 Backend для Telegram Bot (Python)

### requirements.txt
```
aiogram==3.2.0
aiohttp==3.9.0
python-dotenv==1.0.0
```

### bot.py - основной файл бота
```python
import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# Токен бота
BOT_TOKEN = "your_bot_token_here"
WEB_APP_URL = "https://your-domain.com"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_command(message: types.Message):
    # Создаем клавиатуру с Web App
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🎮 Играть в TigerRozetka",
                web_app=WebAppInfo(url=WEB_APP_URL)
            )
        ],
        [
            InlineKeyboardButton(
                text="📊 Статистика",
                callback_data="stats"
            ),
            InlineKeyboardButton(
                text="📚 Правила",
                callback_data="rules"
            )
        ]
    ])
    
    await message.answer(
        "⚡ Добро пожаловать в TigerRozetka! ⚡\n\n"
        "Опасная игра с электричеством в безопасной среде.\n"
        "Нажмите на розетку и попытайтесь выжить!\n\n"
        "🎯 Наберите максимум вольт\n"
        "🏆 Повышайте свой уровень\n"
        "⚡ Чувствуйте каждый разряд через вибрацию\n\n"
        "Нажмите кнопку ниже, чтобы начать:",
        reply_markup=keyboard
    )

@dp.callback_query(lambda c: c.data == "stats")
async def show_stats(callback_query: types.CallbackQuery):
    # Здесь можно показать статистику игрока
    await callback_query.answer("Статистика пока недоступна")

@dp.callback_query(lambda c: c.data == "rules")
async def show_rules(callback_query: types.CallbackQuery):
    rules_text = """
📚 ПРАВИЛА ИГРЫ

🎮 ЦЕЛЬ: Набрать максимум вольт, выживая после нажатий на розетку

⚡ КАК ИГРАТЬ:
• Нажимайте на розетку
• Выживайте или получайте удар током
• Набирайте опыт и повышайте уровень
• Разблокируйте новые виды розеток

💰 ОЧКИ:
• Успешное выживание: 10-30⚡ (зависит от риска)
• Поражение током: 8-25⚡ (утешительный приз)
• Серии побед: бонусы до x3.0
• Достижения: 100-1000⚡

🆙 УРОВНИ:
• Опыт за каждое действие
• Бонусные вольты за уровень
• Новые розетки каждые 5 уровней

📳 ВИБРАЦИЯ:
Почувствуйте каждый разряд! Игра поддерживает тактильную обратную связь.
    """
    await callback_query.message.answer(rules_text)
    await callback_query.answer()

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
```

---

## 🌐 Деплой приложения

### Вариант 1: Vercel (рекомендуется)

1. Подключите GitHub репозиторий к Vercel
2. Установите переменные окружения в настройках Vercel
3. Деплой происходит автоматически при push

### Вариант 2: Netlify

1. Подключите репозиторий к Netlify
2. Настройте build команды:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Вариант 3: Собственный сервер

```bash
# Сборка приложения
npm run build

# Настройка nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔧 Отладка и тестирование

### Тестирование вибрации

1. Откройте игру в Telegram на мобильном устройстве
2. Перейдите в настройки вибрации (кнопка 📳)
3. Протестируйте все типы вибрации
4. Проверьте работу в игре

### Проверка Telegram API

```javascript
// Проверка доступности API
console.log('Telegram WebApp:', window.Telegram?.WebApp);
console.log('HapticFeedback:', window.Telegram?.WebApp?.HapticFeedback);
console.log('Platform:', window.Telegram?.WebApp?.platform);
```

### Лог вибрации

В консоли браузера будут видны сообщения:
```
Telegram Haptic Feedback initialized
HapticFeedback not available in this Telegram version
Not in Telegram environment, haptics disabled
```

---

## 📱 Команды бота

После настройки бот будет поддерживать:

- `/start` - Запуск игры и показ меню
- Кнопка "🎮 Играть" - Открытие Mini App
- Inline клавиатуры для навигации
- Автоматические уведомления о достижениях (будущее)

---

## ⚡ Итоговая проверка

Убедитесь что работает:
- ✅ Вибрация на всех игровых событиях
- ✅ Настройки вибрации сохраняются
- ✅ Telegram Bot отвечает на /start
- ✅ Mini App открывается из бота
- ✅ Игра работает в мобильном Telegram

**Готово!** Ваша игра TigerRozetka полностью интегрирована с Telegram и поддерживает вибрацию! 🎮⚡
