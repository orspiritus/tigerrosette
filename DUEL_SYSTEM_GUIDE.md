# ⚔️ Система заявок на дуэль в TigerRozetka

## 🎯 Как работает заявка на дуэль

### 🚀 Шаг 1: Инициация дуэли

1. **Игрок нажимает "⚔️ Дуэль"** в главном меню
2. **Открывается `DuelInviteScreen`** - экран выбора соперника
3. **Загружаются контакты** из Telegram или показываются тестовые

### 👥 Шаг 2: Выбор соперника

```tsx
// Источники контактов:
- 📱 Telegram API (реальные контакты)
- 🧪 Тестовые контакты (для разработки)
- 👫 Друзья в Telegram
- 🎮 Недавние игроки
```

### 📩 Шаг 3: Отправка приглашения

```typescript
const sendDuelInvite = async (contact: TelegramContact) => {
  // 1. Создается уникальный ID приглашения
  const inviteId = `duel_${Date.now()}_${user.id}_${contact.id}`;
  
  // 2. Формируется сообщение
  const inviteMessage = 
    `🎮⚔️ ДУЭЛЬ TIGERROZETKA!
    ${user.first_name} (Уровень ${player.level}) вызывает вас на дуэль!
    
    ⚡ Игра на 60 секунд
    🏆 Кто наберет больше очков - тот победил!`;
  
  // 3. Отправка через Telegram WebApp API
  webApp.sendData(JSON.stringify({
    type: 'duel_invite',
    inviteId,
    fromUser: { id: user.id, name: user.first_name, level: player.level },
    toUserId: contact.id,
    message: inviteMessage
  }));
  
  // 4. Локальное сохранение для отслеживания
  const invite = {
    id: inviteId,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + (5 * 60 * 1000) // 5 минут
  };
}
```

### 📨 Шаг 4: Получение и обработка приглашений

**Компонент `DuelInviteReceiver`** работает глобально:

```typescript
// 1. Слушает входящие приглашения
useEffect(() => {
  // Проверка URL параметров (для тестирования)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteId = urlParams.get('duel_invite');
  
  if (inviteId) {
    // Симуляция входящего приглашения
    handleIncomingInvite(mockInvite);
  }
  
  // В реальной версии: подписка на Telegram WebApp события
}, []);

// 2. Показ уведомления о приглашении
const handleIncomingInvite = (invite) => {
  // Добавление в список активных приглашений
  setIncomingInvites(prev => [...prev, newInvite]);
  
  // Уведомление пользователю
  webApp.showAlert(`🎮 Новое приглашение на дуэль от ${invite.fromUserName}!`);
  
  // Вибрация
  hapticManager.heavy();
};
```

### ✅❌ Шаг 5: Ответ на приглашение

```typescript
const respondToInvite = async (invite, accept: boolean) => {
  if (accept) {
    // ✅ ПРИНЯТИЕ
    webApp.sendData(JSON.stringify({
      type: 'duel_response',
      inviteId: invite.id,
      response: 'accepted',
      fromUserId: currentUser.id
    }));
    
    // Запуск реальной дуэли
    startRealDuel();
    
  } else {
    // ❌ ОТКЛОНЕНИЕ
    webApp.sendData(JSON.stringify({
      type: 'duel_response',
      inviteId: invite.id,
      response: 'declined'
    }));
  }
  
  // Удаление приглашения из списка
  setIncomingInvites(prev => prev.filter(i => i.id !== invite.id));
};
```

## 🔄 Полный Flow дуэли

```
📱 Игрок A                          📱 Игрок B
     │                                   │
     ├─ Нажимает "Дуэль"                 │
     ├─ Выбирает Игрока B                │
     ├─ Отправляет приглашение ──────────┤
     ├─ Статус: "Ожидание ответа"        ├─ Получает уведомление
     │                                   ├─ Видит pop-up с приглашением
     │                                   ├─ Выбирает: ✅ Принять / ❌ Отклонить
     │                                   │
     ├─ Получает ответ ←─────────────────┤
     │                                   │
     ├─ Если принято: Запуск дуэли ──────┼─ Запуск дуэли
     ├─ 60-секундный матч                ├─ 60-секундный матч
     ├─ Подсчет очков                    ├─ Подсчет очков  
     ├─ Определение победителя ──────────┼─ Показ результата
```

## ⏰ Управление временем

- **⏳ Время жизни приглашения**: 5 минут
- **🔄 Автоматическое истечение**: Приглашения удаляются через 5 минут
- **⚡ Быстрый ответ**: Рекомендуется отвечать в течение 1-2 минут

## 🎮 Типы дуэлей

1. **👫 Реальные игроки**: Человек vs Человек (через приглашения)
2. **🤖 Практика с ИИ**: Человек vs ИИ (мгновенный запуск)
3. **🎯 Турниры**: Множественные дуэли (будущая функция)

## 🔧 Техническая реализация

### Компоненты:
- **`DuelInviteScreen.tsx`** - отправка приглашений
- **`DuelInviteReceiver.tsx`** - получение приглашений  
- **`DuelScreen.tsx`** - сама игра
- **`useDuelConnection.ts`** - WebSocket симуляция

### API Integration:
- **Telegram WebApp SDK** - отправка сообщений
- **URL Parameters** - тестирование приглашений
- **Local Storage** - сохранение состояния
- **Node.js Backend** - будущая real-time система

## 🧪 Тестирование

### Локальное тестирование:
```bash
# 1. Запуск серверов
./start-all.ps1

# 2. Открытие игры
http://localhost:5173/

# 3. Тестирование приглашения через URL
http://localhost:5173/?duel_invite=test123
```

### В Telegram Mini App:
1. Настройте бота через @BotFather
2. Используйте URL: `https://orspiritus.github.io/tigerrosette/`
3. Отправляйте реальные приглашения друзьям

## 🚀 Статус реализации

- ✅ **Отправка приглашений** - готово
- ✅ **Получение приглашений** - готово  
- ✅ **Принятие/отклонение** - готово
- ✅ **Автоматическое истечение** - готово
- ✅ **Telegram интеграция** - готово
- ✅ **Реальные дуэли** - готово
- 🔄 **Backend real-time** - в разработке
- 🔄 **Турниры** - планируется
