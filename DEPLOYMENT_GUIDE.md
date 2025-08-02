# Deployment Guide для TigerRozetka Telegram Mini App

## 📋 Быстрый деплой через Vercel

### 1. Подготовка к деплою

```bash
# Сборка проекта
npm run build

# Проверка сборки
npm run preview
```

### 2. Деплой через Vercel CLI

```bash
# Установка Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login

# Деплой проекта
vercel

# Или для продакшена
vercel --prod
```

### 3. Альтернативный деплой через GitHub

1. Пушим код в GitHub:
```bash
git add .
git commit -m "Ready for Telegram Mini App deployment"
git push origin main
```

2. Идём на vercel.com:
   - New Project
   - Import GitHub Repository
   - Выбираем TigerRozetka
   - Deploy

### 4. Настройка переменных окружения в Vercel

В Dashboard Vercel → Settings → Environment Variables:

```
VITE_TELEGRAM_BOT_TOKEN = ваш_токен_бота
VITE_TELEGRAM_BOT_USERNAME = ваш_username_бота
VITE_APP_URL = https://your-app.vercel.app
VITE_ENABLE_HAPTICS = true
```

### 5. Подключение домена к Telegram боту

После деплоя получите URL (например: `https://tigerrozetka.vercel.app`)

В BotFather:
1. /mybots
2. Выберите бота
3. Bot Settings → Menu Button
4. Edit Menu Button URL: `https://tigerrozetka.vercel.app`

---

## 🔧 Альтернативные варианты деплоя

### Netlify
```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Деплой
netlify deploy --prod --dir=dist
```

### Railway
```bash
# railway.app - простой деплой
# Подключите GitHub репозиторий на railway.app
```

### Telegram Bot Script (Python)

Для полной интеграции можно развернуть бота на Heroku или Railway:

```python
# requirements.txt
aiogram==3.2.0
aiohttp==3.9.0
python-dotenv==1.0.0

# Procfile
web: python bot.py

# bot.py (основной файл бота)
```

---

## ✅ Checklist перед запуском

- [ ] Создан бот через @BotFather
- [ ] Получен токен бота
- [ ] Приложение собрано (`npm run build`)
- [ ] Задеплоено на хостинг
- [ ] URL добавлен в BotFather
- [ ] Протестировано в Telegram
- [ ] Вибрация работает на мобильных устройствах

---

## 🧪 Тестирование

1. Откройте бота в Telegram
2. Нажмите кнопку "🎮 Играть"
3. Проверьте загрузку игры
4. Протестируйте вибрацию на мобильном
5. Проверьте отображение пользователя Telegram

## 📞 Поддержка

При возникновении проблем проверьте:
- Консоль браузера (F12)
- Логи деплоя на Vercel
- Настройки бота в BotFather
