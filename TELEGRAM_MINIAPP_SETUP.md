# 📱 Настройка Telegram Mini App для TigerRozetka

## 🚀 Быстрый старт

### 1. Деплой приложения
```bash
# Выполните деплой
./deploy.ps1
```

### 2. Создание Telegram бота

1. **Создайте бота**:
   - Напишите @BotFather в Telegram
   - Отправьте команду `/newbot`
   - Выберите имя: `TigerRozetka Game`
   - Выберите username: `tigerrozetka_game_bot` (или другой доступный)

2. **Создайте Mini App**:
   - Отправьте команду `/newapp`
   - Выберите вашего бота
   - Введите данные:
     - **App name**: `TigerRozetka`
     - **Description**: `Захватывающая игра с электричеством`
     - **Photo**: Загрузите `public/Media/Pictures/tigrrozetka_a1.png`
     - **Demo GIF**: (опционально)
     - **Web App URL**: `https://orspiritus.github.io/tigerrosette/`
     - **Short name**: `tigerrozetka`

3. **Настройте команды бота**:
   - Отправьте `/setcommands`
   - Выберите вашего бота
   - Добавьте команды:
     ```
     start - 🎮 Начать игру
     game - ⚡ Открыть TigerRozetka
     help - ❓ Помощь
     stats - 📊 Статистика
     ```

4. **Настройте описание**:
   - `/setdescription` - краткое описание
   - `/setabouttext` - подробное описание
   - `/setuserpic` - аватар бота

### 3. Тестирование

1. **Локальное тестирование**:
   ```bash
   npm run dev
   ```
   - Откройте https://t.me/your_bot_name
   - Проверьте работу Mini App

2. **Тестирование в продакшене**:
   - Откройте бота в Telegram
   - Нажмите кнопку "Играть" или отправьте `/game`

## 🔧 Техническая настройка

### Безопасность
- Все данные передаются через защищенное соединение HTTPS
- Используется Telegram Web App API для аутентификации
- Никаких сторонних трекеров или аналитики

### Совместимость
- ✅ iOS (Telegram App)
- ✅ Android (Telegram App)
- ✅ Desktop (Telegram Desktop)
- ✅ Web (Telegram Web)

### Возможные проблемы

1. **Mini App не открывается**:
   - Проверьте URL в настройках бота
   - Убедитесь что сайт доступен по HTTPS
   - Проверьте что в URL указан правильный путь `/tigerrosette/`

2. **Ошибки JavaScript**:
   - Откройте DevTools в браузере
   - Проверьте консоль на ошибки
   - Убедитесь что Telegram Web App SDK загружается

3. **Неправильное отображение**:
   - Проверьте viewport настройки
   - Убедитесь что CSS загружается корректно

## 📋 Checklist для публикации

- [ ] Деплой выполнен успешно
- [ ] Сайт доступен по HTTPS
- [ ] Telegram бот создан
- [ ] Mini App настроен с правильным URL
- [ ] Команды бота настроены
- [ ] Протестировано на разных устройствах
- [ ] Haptic Feedback работает
- [ ] Звуки и эффекты работают
- [ ] Сохранение прогресса работает

## 🌐 URLs

- **Production**: https://orspiritus.github.io/tigerrosette/
- **Repository**: https://github.com/orspiritus/tigerrosette
- **Bot URL**: https://t.me/your_bot_name (замените на ваш)

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в браузере (F12 → Console)
2. Убедитесь что все файлы доступны
3. Проверьте настройки бота в @BotFather
