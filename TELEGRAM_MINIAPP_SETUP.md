# 🎮 Подключение TigerRozetka к Telegram Mini Apps

## ✅ Готово к деплойменту!

Ваше приложение готово к публикации. Следуйте этим шагам:

## 📋 Пошаговая инструкция

### 1. Загрузка на GitHub
```bash
# Если репозиторий еще не создан:
git init
git add .
git commit -m "Initial commit: TigerRozetka Telegram Mini App"
git remote add origin https://github.com/orspiritus/tigerrosette.git
git push -u origin main
```

### 2. Включение GitHub Pages
1. Перейдите в репозиторий: https://github.com/orspiritus/tigerrosette
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "gh-pages" (будет создана автоматически)
5. Save

### 3. Настройка в BotFather
1. Откройте @BotFather в Telegram
2. Отправьте: `/mybots`
3. Выберите `@tigerrozetka_bot`
4. Нажмите "Edit Bot"
5. Выберите "Edit Bot Info"
6. Нажмите "Edit Description" и введите:
   ```
   🎮 TigerRozetka - увлекательная игра с розетками!
   
   Нажимайте на розетки, набирайте очки и продвигайтесь по уровням.
   Игра поддерживает вибрацию на мобильных устройствах.
   ```
7. Вернитесь назад и выберите "Bot Settings"
8. Нажмите "Menu Button"
9. Укажите URL: `https://orspiritus.github.io/tigerrosette/`
10. Текст кнопки: "🎮 Играть"

### 4. Создание Web App
1. В @BotFather отправьте: `/newapp`
2. Выберите `@tigerrozetka_bot`
3. Заполните данные:
   - **App Name**: `TigerRozetka Game`
   - **Description**: `Игра с розетками - набирай очки и повышай уровень!`
   - **Photo**: Загрузите картинку из `Media/Pictures/tigrrozetka_1.png`
   - **Web App URL**: `https://orspiritus.github.io/tigerrosette/`

## 🔧 Параметры для вашего бота

Ваш бот: `@tigerrozetka_bot`
URL приложения: `https://orspiritus.github.io/tigerrosette/`
Токен бота: `7735995745:AAEhkoXf9Gnai97p0ZxF_p23op7bfvnN6d8`

## 🚀 Автоматический деплоймент

После push в main ветку:
1. GitHub Actions автоматически собирает приложение
2. Деплоит на GitHub Pages
3. Приложение обновляется без вашего участия

## ✨ Возможности приложения

- 🎯 **Игровой процесс**: Нажимайте на розетки, набирайте очки
- 📈 **Система уровней**: 6 уровней с разными изображениями
- 📱 **Вибрация**: Haptic feedback на мобильных устройствах
- 🎵 **Звуки**: Звуковые эффекты для всех действий
- ⚙️ **Настройки**: Отключение вибрации и звуков
- 📊 **Статистика**: Подробная информация об очках

## 🔍 Проверка работы

### В браузере:
1. Откройте: https://orspiritus.github.io/tigerrosette/
2. Игра должна загрузиться и работать

### В Telegram:
1. Найдите @tigerrozetka_bot
2. Отправьте /start
3. Нажмите кнопку меню "🎮 Играть"
4. Игра откроется как Mini App

## ⚠️ Важные заметки

- **Вибрация** работает только в Telegram на мобильных устройствах
- **В браузере** вместо вибрации показывается визуальная анимация
- **Автосохранение** прогресса в localStorage
- **Адаптивный дизайн** под все экраны

## 🛠️ Команды для разработки

```bash
# Локальная разработка
npm run dev

# Сборка проекта
npm run build

# Деплоймент (ручной)
npm run deploy

# Проверка кода
npm run lint
```

## 📞 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера (F12)
2. Убедитесь что GitHub Pages включены
3. Проверьте правильность URL в BotFather
4. GitHub Actions покажет ошибки сборки

**Ваше приложение готово к использованию! 🎉**
