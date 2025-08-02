# 🚀 Полное руководство по подключению TigerRozetka к Telegram Mini Apps

## ✅ Текущий статус интеграции

Ваш проект **TigerRozetka** уже готов к подключению к Telegram Mini Apps:

- ✅ **Telegram SDK установлен** (@telegram-apps/sdk)
- ✅ **Система вибрации готова** (HapticFeedback API)
- ✅ **TypeScript типы настроены** (TelegramWebApp, HapticFeedback)
- ✅ **Базовая интеграция в App.tsx**
- ✅ **TelegramProvider компонент создан**
- ✅ **Отображение пользователя Telegram**

---

## 📋 Пошаговый план подключения

### Шаг 1: Создание Telegram Bot

1. **Найдите @BotFather в Telegram**
2. **Отправьте команду**: `/newbot`
3. **Введите имя бота**: `TigerRozetka Bot`
4. **Введите username**: `@tigerrozetka_bot` (или любой доступный)
5. **Скопируйте токен** (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Шаг 2: Настройка Mini App в боте

1. **Отправьте**: `/mybots`
2. **Выберите** вашего бота
3. **Нажмите**: `Bot Settings` → `Menu Button`
4. **Выберите**: `Configure Menu Button`
5. **Установите**:
   - Text: `🎮 Играть`
   - URL: `https://your-domain.com` (пока временный)

### Шаг 3: Создание .env файла

Создайте файл `.env` в корне проекта:

```env
VITE_TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
VITE_TELEGRAM_BOT_USERNAME=ваш_username_бота
VITE_APP_URL=https://your-domain.com
VITE_ENABLE_HAPTICS=true
VITE_DEBUG_MODE=false
```

### Шаг 4: Деплой приложения

#### Вариант A: Vercel (рекомендуется)

```bash
# Установка Vercel CLI
npm install -g vercel

# Сборка проекта
npm run build

# Деплой
vercel

# Или для продакшена
vercel --prod
```

#### Вариант B: Через GitHub + Vercel

1. **Загрузите код на GitHub**:
```bash
git add .
git commit -m "Ready for Telegram Mini App"
git push origin main
```

2. **Перейдите на vercel.com**:
   - New Project
   - Import from GitHub
   - Выберите репозиторий TigerRozetka
   - Deploy

3. **Добавьте переменные окружения в Vercel**:
   - Settings → Environment Variables
   - Добавьте все переменные из .env

### Шаг 5: Обновление URL в боте

После деплоя получите URL (например: `https://tigerrozetka.vercel.app`)

1. **В BotFather отправьте**: `/mybots`
2. **Выберите бота** → `Bot Settings` → `Menu Button`
3. **Обновите URL**: `https://your-deployed-app.vercel.app`

---

## 🎮 Функции уже готовые к использованию

### 📳 Система вибрации
- **5 типов интенсивности**: light, medium, heavy, soft, rigid
- **3 типа уведомлений**: success, error, warning
- **Игровые события**: нажатие на розетку, удар током, повышение уровня
- **Настройки**: включение/выключение, тестирование

### 👤 Информация о пользователе
- **Отображение аватара** и имени
- **Статус Premium** (⭐)
- **Платформа** и цветовая схема
- **Username** пользователя

### 🎯 Игровые механики
- **Уровневая система** с динамическими изображениями розеток
- **Система опыта** и вольт
- **Звуковые эффекты** (Web Audio API)
- **Анимации** (Framer Motion)

---

## 🧪 Тестирование

### Локальное тестирование
```bash
npm run dev
# Откройте http://localhost:3000
```

### Тестирование в Telegram
1. **Найдите своего бота** в Telegram
2. **Нажмите** `/start`
3. **Нажмите кнопку** "🎮 Играть"
4. **Проверьте**:
   - Загрузка игры
   - Отображение пользователя
   - Работа вибрации (на мобильном)
   - Звуковые эффекты

---

## 🔧 Дополнительные возможности

### Уведомления пользователям
```typescript
// В коде игры можно использовать:
window.Telegram?.WebApp?.showAlert('Поздравляем с новым уровнем!');
window.Telegram?.WebApp?.showPopup({
  title: 'Достижение разблокировано!',
  message: 'Вы достигли уровня 10!',
  buttons: [{ type: 'ok', text: 'Отлично!' }]
});
```

### Отправка данных боту
```typescript
// Отправка результатов игры боту
window.Telegram?.WebApp?.sendData(JSON.stringify({
  action: 'game_result',
  score: 1500,
  level: 5
}));
```

### Интеграция с Telegram Stars (монетизация)
```typescript
// Открытие инвойса для покупки
window.Telegram?.WebApp?.openInvoice('https://t.me/$invoice_link');
```

---

## 📱 Особенности мобильной версии

### iOS (iPhone/iPad)
- ✅ Полная поддержка вибрации
- ✅ Telegram HapticFeedback API
- ✅ Звуковые эффекты

### Android
- ✅ Поддержка вибрации
- ✅ Navigator.vibrate fallback
- ✅ Адаптивный интерфейс

### Веб-версия
- ⚠️ Ограниченная вибрация (Navigator.vibrate)
- ✅ Визуальная обратная связь
- ✅ Полная функциональность игры

---

## 🐛 Решение проблем

### Проблема: Белый экран
```bash
# Проверьте консоль браузера (F12)
# Обычно проблема в переменных окружения
```

### Проблема: Вибрация не работает
```typescript
// Проверьте в консоли:
console.log('Telegram WebApp:', window.Telegram?.WebApp);
console.log('HapticFeedback:', window.Telegram?.WebApp?.HapticFeedback);
```

### Проблема: Пользователь не отображается
```typescript
// Проверьте initDataUnsafe:
console.log('User data:', window.Telegram?.WebApp?.initDataUnsafe?.user);
```

---

## 🎯 Финальный чеклист

- [ ] Создан бот через @BotFather
- [ ] Получен токен бота
- [ ] Создан .env файл с токеном
- [ ] Приложение задеплоено (Vercel/Netlify)
- [ ] URL обновлён в BotFather
- [ ] Протестировано в Telegram на мобильном
- [ ] Вибрация работает
- [ ] Отображается информация о пользователе

---

## 🚀 Готово к запуску!

После выполнения всех шагов ваша игра **TigerRozetka** будет полностью интегрирована с Telegram Mini Apps и готова к использованию миллионами пользователей Telegram!

### Дальнейшее развитие
- 🔄 Многопользовательский режим
- 💰 Интеграция с Telegram Stars
- 🏆 Турниры и лидерборды
- 🎁 NFT/TON интеграция
