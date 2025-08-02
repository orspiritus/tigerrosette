# TigerRozetka - Telegram Mini App Game

## Концепция игры

**TigerRozetka** - это многопользовательская игра для Telegram Mini Apps, где участники чата могут взаимодействовать друг с другом в опасной игре с электричеством. Один игрок "суёт пальцы в розетку", а другой "включает ток". Результат определяется случайно, создавая напряжённую и веселую атмосферу.

## Основной геймплей

### Механика игры
- **Роли игроков**: 
  - "Смельчак" - тот, кто взаимодействует с розеткой
  - "Электрик" - тот, кто управляет подачей тока
- **Система рулетки**: Случайный результат определяет, поразит током или нет
- **Очки/валюта**: "Вольты" (⚡) - игровая валюта за участие
- **Награды**: 
  - За выживание: +10-50 вольт
  - За поражение током: +5-20 вольт (утешительный приз)
  - Бонусы за серии удачных/неудачных попыток

### Магазин предметов

#### Защитные предметы (уменьшают урон/увеличивают шансы выживания):
- **Резиновые перчатки** (100⚡) - +10% к выживанию
- **Диэлектрические боты** (250⚡) - +15% к выживанию
- **Изолирующий костюм** (500⚡) - +25% к выживанию
- **Клетка Фарадея** (1000⚡) - +40% к выживанию

#### Атакующие предметы (увеличивают мощность розетки):
- **Усиленная розетка** (150⚡) - +10% урона
- **Промышленный трансформатор** (300⚡) - +20% урона
- **Высоковольтная линия** (600⚡) - +35% урона
- **Генератор Тесла** (1200⚡) - +50% урона
- **Молниевой лазер** (2000⚡) - +75% урона

## Необходимые изображения и промпты для генерации

### Основные элементы интерфейса

#### 1. Главная розетка (центральный элемент)
**Промпт**: "Cartoon-style electrical outlet with tiger stripes pattern, orange and black colors, slightly menacing but cute appearance, glowing when active, 2D game art style, white background"

#### 2. Анимации электрического разряда
**Промпт**: "Electric lightning bolt animation frames, blue and white electricity, cartoon style, various intensities from weak spark to powerful lightning, transparent background, 2D game effects"

#### 3. Персонажи-игроки

##### Смельчак (базовый персонаж)
**Промпт**: "Cute cartoon character reaching toward electrical outlet, slightly nervous expression, simple 2D game art style, colorful clothing, white background"

##### Электрик (базовый персонаж)
**Промпт**: "Cartoon electrician character holding electrical switch, confident expression, wearing work clothes and hard hat, 2D game art style, white background"

### Предметы защиты

#### Резиновые перчатки
**Промпт**: "Bright yellow rubber electrical safety gloves, cartoon style, thick insulation, 2D game item icon, white background"

#### Диэлектрические боты
**Промпт**: "Red safety boots with electrical insulation symbols, cartoon style, rubber material texture, 2D game item icon, white background"

#### Изолирующий костюм
**Промпт**: "Full body electrical safety suit, bright orange color, with electrical insulation symbols, cartoon style, 2D game item icon, white background"

#### Клетка Фарадея
**Промпт**: "Metallic protective cage around character, electrical field deflection effect, cartoon style, copper/bronze coloring, 2D game item icon, white background"

### Атакующие предметы

#### Усиленная розетка
**Промпт**: "Enhanced electrical outlet with metal reinforcement, sparks around edges, tiger stripe pattern, menacing glow, cartoon style, 2D game item icon, white background"

#### Промышленный трансформатор
**Промпт**: "Large industrial electrical transformer, metal housing with cooling fins, electrical warning symbols, cartoon style, 2D game item icon, white background"

#### Высоковольтная линия
**Промпт**: "High voltage electrical transmission line with insulators, electrical sparks, danger signs, cartoon style, 2D game item icon, white background"

#### Генератор Тесла
**Промпт**: "Tesla coil generator with electrical arcs, metallic tower structure, purple electrical discharge, steampunk cartoon style, 2D game item icon, white background"

#### Молниевой лазер
**Промпт**: "Futuristic lightning laser cannon, sci-fi design, blue energy core, electrical discharge effects, cartoon style, 2D game item icon, white background"

### Эффекты и анимации

#### Успешное поражение током
**Промпт**: "Cartoon character being electrocuted, hair standing up, skeleton visible through body, comical expression, blue lightning effects, 2D animation frames, white background"

#### Успешное избежание
**Промпт**: "Cartoon character celebrating success, happy expression, small sparks around but no damage, relief gesture, 2D animation frames, white background"

#### Фоновые эффекты
**Промпт**: "Electrical workshop background, various electrical equipment, cables, warning signs, cartoon style, atmospheric lighting, 2D game background"

### UI элементы

#### Счётчик вольт
**Промпт**: "Digital electrical meter displaying voltage numbers, retro electronic style, green glowing digits, cartoon style, UI element, transparent background"

#### Кнопки действий
**Промпт**: "Large red emergency button labeled 'ВКЛЮЧИТЬ ТОК', industrial style, warning symbols, cartoon style, UI button, white background"

**Промпт**: "Electrical outlet interaction button, tiger stripe pattern, glowing orange, cartoon style, UI button, white background"

### Дополнительные элементы

#### Таблица лидеров
**Промпт**: "Electrical scoreboard with player rankings, industrial design, electrical theme, cartoon style, copper and brass colors, UI element"

#### Звуковые эффекты (референсы для аудио)
- Электрический разряд (различной мощности)
- Гудение трансформатора
- Звук включения рубильника
- Победные/проигрышные джинглы

## Техническое описание

### Платформа
- **Telegram Mini Apps**
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js/Python для обработки игровых сессий
- **База данных**: PostgreSQL/MongoDB для хранения прогресса игроков
- **Real-time**: WebSocket для синхронизации действий игроков

### Особенности реализации
- Интеграция с Telegram Bot API (aiogram)
- url для Telegram MiniApps: https://github.com/orspiritus/tigerrosette.git  (ssh: git@github.com:orspiritus/tigerrosette.git)
- Система чатов для многопользовательского взаимодействия
- Сохранение прогресса между сессиями
- Система достижений и рейтингов
- Ежедневные бонусы и события

## Монетизация (опционально)
- Покупка дополнительных вольт за Telegram Stars
- Премиум предметы и скины
- Реклама между раундами
- Донаты в чате для увеличения призового