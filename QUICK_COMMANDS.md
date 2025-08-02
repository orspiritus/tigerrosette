# 🚀 Быстрые команды для TigerRozetka

## Разработка
```bash
npm run dev    # Запуск dev сервера
```

## Деплой на GitHub Pages
```bash
# Метод 1: PowerShell скрипт (рекомендуется)
./deploy.ps1

# Метод 2: Вручную
npm run build
mkdir -p dist/Media/Pictures
cp Media/Pictures/*.png dist/Media/Pictures/
npx gh-pages -d dist
```

## Важные ссылки
- **Живой сайт**: https://orspiritus.github.io/tigerrosette/
- **Репозиторий**: https://github.com/orspiritus/tigerrosette
- **Bot в Telegram**: @tigerrozetka_bot
- **BotFather**: @BotFather

## Структура для Telegram Mini App
✅ index.html с Telegram WebApp SDK
✅ Правильный base path: /tigerrosette/
✅ Медиафайлы в правильных путях
✅ TypeScript типы для Telegram API
✅ HapticFeedback интеграция
✅ PWA манифест
