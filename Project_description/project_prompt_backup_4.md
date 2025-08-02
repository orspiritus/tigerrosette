# TigerRozetka - Telegram Mini App Game
## Русское название "Тигррозетка"

### 🎮 Обзор проекта
**TigerRozetka** - многопользовательская игра-рулетка для Telegram Mini Apps с элементами социального взаимодействия и коллекционирования. Игроки участвуют в "опасной" игре с электричеством в безопасной игровой среде.

---

## 🎯 Концепция игры

### Основная механика
Игра построена вокруг взаимодействия между игроками в чате Telegram:
- **Смельчак** взаимодействует с розеткой (нажимает на UI элемент)
- **Электрик** управляет подачей тока (активирует переключатель)
- **Результат** определяется продвинутой системой случайности (случайным является количество времени, во время которого электричество действует на смельчака) с учетом предметов и статистики, с учётом построенной электрической цепи. (Электрический ток должен быть способен пройти по сети - в ней не должно быть разрывов). На уровнях, кроме первого, должна быть возможность построить цепь из нескольких элементов.

### Многопользовательские цепи
- При участии 3+ игроков формируются электрические цепи
- Случайное распределение "поражений" по цепи
- Бонусные очки за участие в групповых сессиях

---

## ⚡ Игровая экономика

### Валюта: Вольты (⚡)
**Источники дохода:**
- Базовое участие: 5-10⚡
- Выживание: 15-50⚡ (зависит от сложности)
- Поражение током: 8-25⚡ (утешительный приз)
- Серии побед: до +100% бонуса
- Ежедневные задания: 50-200⚡
- Достижения: 100-1000⚡

### Система множителей
- **Streak бонусы**: x1.5, x2.0, x2.5 за серии (5, 10, 15 раундов)
- **Групповые бонусы**: +25% за каждого дополнительного игрока
- **Временные события**: до x3.0 в особые дни

---

## 🛒 Магазин и предметы

### 🛡️ Защитные предметы
| Предмет | Цена | Эффект | Длительность |
|---------|------|--------|--------------|
| **Резиновые перчатки** | 100⚡ | +10% выживание | 10 раундов |
| **Диэлектрические боты** | 250⚡ | +15% выживание | 15 раундов |
| **Изолирующий костюм** | 500⚡ | +25% выживание | 20 раундов |
| **Клетка Фарадея** | 1000⚡ | +40% выживание | 30 раундов |
| **Квантовый щит** | 2500⚡ | +60% выживание | 50 раундов |

### ⚡ Атакующие предметы
| Предмет | Цена | Эффект | Применение |
|---------|------|--------|------------|
| **Усиленная розетка** | 150⚡ | +10% мощность | Одноразово |
| **Промышленный трансформатор** | 300⚡ | +20% мощность | 5 применений |
| **Высоковольтная линия** | 600⚡ | +35% мощность | 8 применений |
| **Генератор Тесла** | 1200⚡ | +50% мощность | 12 применений |
| **Молниевой лазер** | 2500⚡ | +75% мощность | 20 применений |

### 🎨 Косметические предметы
- **Скины розеток**: Неоновая, Ретро, Космическая (200-800⚡)
- **Эффекты разрядов**: Радужный, Лазерный, Плазменный (300-1000⚡)
- **Персональные аватары**: 50+ уникальных дизайнов (100-500⚡)

---

## 🎨 Техническое задание на графику

### Основные UI элементы

#### 1. Центральная розетка
```
Промпт: "Cartoon electrical outlet with animated tiger stripes, orange-black gradient, 
subtle glow animation, friendly but dangerous appearance, modern 2D game art, 
vector style, transparent background, multiple states (idle/active/sparking)"
```

#### 2. Анимации электричества
```
Промпт: "Stylized lightning effects collection, blue-white electricity with yellow accents,
cartoon style, 8-frame animation cycles, various intensities (weak/medium/strong),
particle effects, transparent background, 60fps smooth animation"
```

#### 3. Игровые персонажи

**Смельчак (основной):**
```
Промпт: "Cute cartoon character with expressive emotions, modern casual clothing,
nervous-to-confident animation states, 2D rigged character, colorful palette,
hand reaching animations, victory/defeat poses"
```

**Электрик (основной):**
```
Промпт: "Professional cartoon electrician, safety gear, confident stance,
switch-flipping animations, tool belt, hard hat with lightning logo,
multiple emotional states, 2D character design"
```

### Предметы и эффекты

#### Защитные предметы (детализированные промпты)
```
Резиновые перчатки: "Yellow safety gloves with texture details, electrical resistance symbols,
cartoon shading, item icon 128x128px, hover glow effect"

Клетка Фарадея: "Electromagnetic field visualization, copper mesh cage,
electrical deflection animation, sci-fi cartoon style, protective aura effect"
```

#### Атакующие предметы
```
Генератор Тесла: "Steampunk Tesla coil, purple electrical arcs, spinning mechanism,
steam and spark particles, bronze-copper materials, industrial cartoon design"

Молниевой лазер: "Futuristic weapon design, blue energy core, charging animation,
sci-fi UI elements, beam focusing lens, high-tech cartoon style"
```

### UI/UX элементы

#### Игровой интерфейс
- **Счетчик вольт**: Ретро-дисплей с анимацией цифр
- **Индикатор здоровья**: Сердце с электрическими импульсами
- **Таймер раунда**: Электронные часы с обратным отсчетом
- **Кнопки действий**: Большие, яркие, с тактильной обратной связью

---

## 💻 Техническая архитектура

### Frontend (Telegram Mini App)
```typescript
// Технологический стек
- Framework: React 18 + TypeScript
- Styling: Styled-components + Telegram UI
- State Management: Zustand
- Animations: Framer Motion
- WebSocket: Socket.io-client
- Build: Vite
```

### Backend
```python
# Python FastAPI + aiogram
- API: FastAPI (async)
- Bot: aiogram 3.x
- WebSocket: FastAPI WebSocket
- Database: PostgreSQL + Redis cache
- Authentication: Telegram Mini Apps validation
```

### База данных (PostgreSQL схема)
```sql
-- Основные таблицы
Users: id, telegram_id, username, volts, created_at, last_active
GameSessions: id, chat_id, players[], status, created_at
UserItems: user_id, item_id, quantity, expires_at
Statistics: user_id, games_played, wins, losses, streaks
```

### WebSocket события
```javascript
// Клиент -> Сервер
'join_game', 'leave_game', 'player_action', 'use_item'

// Сервер -> Клиент
'game_state', 'player_joined', 'round_result', 'volts_updated'
```

---

## 🎮 Расширенная игровая механика

### Система достижений
- **Серийные достижения**: 5, 10, 25, 50, 100 побед подряд
- **Коллекционные**: Собрать все предметы категории
- **Социальные**: Игры с 10+ разными игроками
- **Временные**: Участие в событиях

### Ежедневные активности
- **Задания**: "Выиграй 3 раунда", "Используй 5 предметов"
- **Бонусы входа**: Прогрессивные награды (день 7 = 500⚡)
- **Счастливый час**: x2 награды в случайное время

### Турниры и события
- **Еженедельные турниры**: Таблица лидеров с призами
- **Сезонные события**: Специальные предметы и скины
- **Групповые вызовы**: Цели для всего сообщества

---

## 📊 Аналитика и метрики

### KPI для отслеживания
- DAU/MAU (Daily/Monthly Active Users)
- Retention Rate (1-day, 7-day, 30-day)
- ARPU (Average Revenue Per User)
- Session Length и частота игр
- Конверсия в покупки

### A/B тестирование
- Баланс экономики (награды vs цены)
- UI/UX элементы
- Частота появления событий
- Сложность игровых механик

---

## 💰 Монетизация

### Telegram Stars интеграция
- **Пакеты вольт**: 1000⚡ = 100 Stars
- **Премиум пропуск**: Удвоенные награды (300 Stars/месяц)
- **Эксклюзивные предметы**: Только за Stars

### Дополнительные источники
- **Реклама**: Rewarded ads за бонусные вольты
- **Донаты в чат**: Общий призовой фонд
- **NFT элементы**: Уникальные коллекционные предметы

---

## 🚀 План разработки

### Фаза 1 (MVP) - 4 недели
- [ ] Базовая игровая механика
- [ ] Telegram Mini App интеграция
- [ ] Простой UI
- [ ] Система счета

### Фаза 2 (Core Features) - 6 недель
- [ ] Магазин предметов
- [ ] Многопользовательские сессии
- [ ] Система достижений
- [ ] Улучшенная графика

### Фаза 3 (Advanced) - 8 недель
- [ ] Турниры и события
- [ ] Аналитическая система
- [ ] Монетизация
- [ ] Оптимизация производительности

---

## Github pages  

**Repository**: [GitHub - TigerRozetka](https://github.com/orspiritus/tigerrosette)
**SSH Clone**: `git@github.com:orspiritus/tigerrosette.git`

---

*Документ обновлен: 2 августа 2025*