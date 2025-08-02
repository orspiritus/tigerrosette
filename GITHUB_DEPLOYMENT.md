# GitHub Pages Deployment Guide для TigerRozetka Telegram Mini App

## Быстрый старт

### 1. Подготовка репозитория
```bash
# Клонировать репозиторий
git clone https://github.com/orspiritus/tigerrosette.git
cd tigerrosette

# Установить зависимости
npm install
```

### 2. Сборка и деплоймент
```bash
# Локальная сборка для проверки
npm run build

# Автоматический деплоймент на GitHub Pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## URL приложения
После деплоймента ваше приложение будет доступно по адресу:
**https://orspiritus.github.io/tigerrosette/**

## Настройка Telegram Mini App

### 1. Через BotFather
1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newapp`
3. Выберите вашего бота `@tigerrozetka_bot`
4. Укажите следующие данные:
   - **App Name**: `TigerRozetka Game`
   - **Description**: `Игра TigerRozetka - нажимай на розетки и получай очки!`
   - **Photo**: Загрузите одну из картинок из `Media/Pictures/`
   - **Web App URL**: `https://orspiritus.github.io/tigerrosette/`

### 2. Настройка переменных окружения

В GitHub репозитории добавьте Secrets:
1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте следующие secrets:
   - `VITE_TELEGRAM_BOT_USERNAME`: `tigerrozetka_bot`
   - `VITE_APP_URL`: `https://orspiritus.github.io/tigerrosette`

### 3. Включение GitHub Pages
1. В репозитории перейдите в Settings → Pages
2. Выберите Source: "Deploy from a branch"
3. Выберите Branch: "gh-pages"
4. Нажмите Save

## Автоматический деплоймент
GitHub Action автоматически:
- Собирает проект при каждом push в main
- Деплоит на GitHub Pages
- Обновляет приложение без вашего участия

## Проверка работоспособности

### Локальная проверка
```bash
# Запуск dev сервера
npm run dev
# Открыть http://localhost:3000
```

### Проверка в Telegram
1. Откройте чат с ботом @tigerrozetka_bot
2. Отправьте команду `/start`
3. Нажмите кнопку "Открыть игру" или команду с веб-приложением
4. Игра должна загрузиться с полным функционалом

## Особенности для Mini Apps

### Haptic Feedback
- Автоматически работает в Telegram на iOS/Android
- Fallback для браузеров с визуальной анимацией
- Настройки вибрации доступны в игре

### Telegram API
- Интеграция с @telegram-apps/sdk
- Получение данных пользователя
- Уведомления и вибрация

### Оптимизация
- Chunked bundles для быстрой загрузки
- Кэширование ресурсов
- Адаптивный дизайн для мобильных устройств

## Troubleshooting

### Белый экран
- Проверьте консоль браузера на ошибки
- Убедитесь что все переменные окружения настроены
- Проверьте правильность base URL в vite.config.ts

### Не работает вибрация
- В браузере показывается визуальная анимация
- В Telegram работает нативная вибрация
- Можно отключить в настройках игры

### Проблемы с деплойментом
- Проверьте GitHub Actions во вкладке Actions
- Убедитесь что gh-pages ветка создана
- Проверьте настройки Pages в репозитории

## Обновление приложения
Просто сделайте push в main ветку - деплоймент произойдет автоматически:
```bash
git add .
git commit -m "Update game features"
git push origin main
```

## Мониторинг
- GitHub Actions покажет статус деплоймента
- Логи сборки доступны в Actions
- Ошибки отображаются в консоли браузера

## Дополнительные команды
```bash
# Предварительный просмотр продакшен сборки
npm run preview

# Линтинг кода
npm run lint

# Ручной деплоймент (если нужен)
npm run deploy
```
