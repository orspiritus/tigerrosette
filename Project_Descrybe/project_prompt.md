# 🎮 Промпт для разработки многопользовательской части TigerRozetka

## 📋 Техническое задание

Необходимо разработать серверную многопользовательскую часть для существующей игры **TigerRozetka** - Telegram Mini App игры с электрическими розетками. Игра уже имеет полностью рабочий фронтенд на React + TypeScript, развернутый на GitHub Pages.

## 🎯 Цель проекта

Создать backend API и real-time функциональность для превращения одиночной игры в многопользовательскую с элементами социального взаимодействия, соревнований и глобальной статистики.## 🎯 Цели проекта

**Основная цель**: Создать engaging многопользовательский опыт с устойчивой монетизационной моделью, который увеличит retention, время в игре и доходы.

**Метрики успеха**:

### 🎮 Игровые метрики
- 30%+ пользователей пробуют мультиплеер в первую неделю
- 60%+ retention на 7 день после добавления друзей
- Среднее время сессии увеличивается на 40%
- 20%+ пользователей возвращаются для участия в турнирах

### 💰 Экономические метрики
- **Conversion rate**: 3-5% пользователей совершают покупки
- **ARPU**: $0.50-1.00 на активного пользователя в месяц
- **ARPPU**: $15-25 на платящего пользователя в месяц
- **LTV/CAC ratio**: 3:1 или выше
- **Ad revenue**: $0.20-0.40 на пользователя в месяц

### � Engagement метрики  
- **DAU/MAU ratio**: 25%+ (высокий engagement)
- **Session frequency**: 3+ сессии в день у активных игроков
- **Social features adoption**: 40%+ добавляют друзей
- **Referral rate**: 15%+ приводят новых игроков

---

*Этот промпт содержит все необходимые детали для создания полноценной многопользовательской платформы для TigerRozetka с фокусом на социальное взаимодействие, соревновательность и устойчивую монетизацию.*нические требования

### 💻 Предпочтительный технологический стек
- **Backend**: Node.js + Express.js или Python + FastAPI
- **База данных**: PostgreSQL + Redis для кэширования
- **Real-time**: Socket.io или WebSockets
- **Аутентификация**: Telegram Mini Apps API для идентификации пользователей
- **Хостинг**: Railway, Heroku, DigitalOcean или AWS (бесплатные/дешевые варианты)
- **API**: RESTful API + WebSocket для real-time функций

### 🔐 Безопасность и аутентификация
- Интеграция с Telegram Mini Apps SDK для верификации пользователей
- Валидация Telegram initData для предотвращения фальсификации
- Rate limiting для предотвращения спама
- Защита от читерства в игровых метриках

## 🚀 Основные функции для реализации

### 👥 Пользовательская система
```typescript
interface User {
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  level: number;
  totalExperience: number;
  totalVolts: number;
  totalClicks: number;
  registrationDate: Date;
  lastActiveDate: Date;
  achievements: Achievement[];
  statistics: UserStatistics;
}

interface UserStatistics {
  gamesPlayed: number;
  totalPlayTime: number;
  averageSessionTime: number;
  bestStreak: number;
  totalShocks: number;
  successRate: number;
  favoriteDifficulty: string;
}
```

### 🏆 Система лидерборда
```typescript
interface Leaderboard {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

interface LeaderboardEntry {
  userId: number;
  username: string;
  score: number;
  level: number;
  achievements: number;
  rank: number;
}
```

### 🎮 Многопользовательские режимы

#### 1. **Real-time соревнования**
- Комнаты на 2-10 игроков
- Синхронное начало игры
- Общий таймер (30 сек, 1 мин, 2 мин)
- Победитель по количеству очков
- Система рейтинга ELO

#### 2. **Еженедельные турниры**
- Автоматическое создание турниров каждый понедельник
- Регистрация участников в течение недели
- Подсчет лучших результатов
- Призы для топ-10 игроков

#### 3. **Кооперативные челленджи**
- Общие цели для всех игроков
- Прогресс сообщества (например, "Вместе накликать 1 миллион вольт")
- Награды для всех участников при достижении цели

### 🎯 API эндпоинты

#### Аутентификация
```
POST /api/auth/telegram - Аутентификация через Telegram
GET /api/auth/me - Получить информацию о текущем пользователе
```

#### Профиль пользователя
```
GET /api/users/:id - Получить профиль пользователя
PUT /api/users/me - Обновить профиль
GET /api/users/me/statistics - Получить статистику
POST /api/users/me/sync - Синхронизировать прогресс с клиента
```

#### Лидерборды
```
GET /api/leaderboards/daily - Дневной лидерборд
GET /api/leaderboards/weekly - Недельный лидерборд
GET /api/leaderboards/monthly - Месячный лидерборд
GET /api/leaderboards/all-time - Общий лидерборд
GET /api/leaderboards/friends - Лидерборд среди друзей
```

#### Многопользовательские игры
```
POST /api/multiplayer/rooms - Создать комнату
GET /api/multiplayer/rooms - Получить список комнат
POST /api/multiplayer/rooms/:id/join - Присоединиться к комнате
DELETE /api/multiplayer/rooms/:id/leave - Покинуть комнату
GET /api/multiplayer/history - История игр
```

#### Достижения и статистика
```
GET /api/achievements - Список всех достижений
POST /api/achievements/unlock - Разблокировать достижение
GET /api/statistics/global - Глобальная статистика игры
```

### 🔄 Real-time события (WebSocket)

```typescript
// События от клиента к серверу
interface ClientEvents {
  'game:start': { roomId: string };
  'game:click': { score: number; isShocked: boolean };
  'game:finish': { finalScore: number; statistics: GameStatistics };
  'room:join': { roomId: string };
  'room:leave': { roomId: string };
}

// События от сервера к клиенту
interface ServerEvents {
  'room:joined': { room: Room; players: Player[] };
  'room:player_joined': { player: Player };
  'room:player_left': { playerId: number };
  'game:started': { countdown: number };
  'game:player_score': { playerId: number; score: number };
  'game:finished': { results: GameResults[] };
  'leaderboard:updated': { leaderboard: LeaderboardEntry[] };
}
```

## 🎮 Игровые режимы для реализации

### 1. **Quick Match** (Быстрая игра)
- Автоматический подбор противника
- Игра 1v1 на время (60 секунд)
- Рейтинговая система

### 2. **Tournament Mode** (Турнирный режим)
- Еженедельные турниры
- Группы по уровням игроков
- Система плей-офф

### 3. **Challenge Mode** (Режим вызовов)
- Игроки могут бросать вызовы друзьям
- Асинхронные соревнования
- Сравнение лучших результатов

### 4. **Community Goals** (Общие цели)
- Глобальные челленджи для всех игроков
- Совместный прогресс
- Коллективные награды

## 🗄️ Структура базы данных

### Основные таблицы
```sql
-- Пользователи
users (id, telegram_id, username, first_name, last_name, level, total_experience, 
       total_volts, created_at, updated_at, last_active)

-- Игровые сессии
game_sessions (id, user_id, score, duration, clicks, shocks, difficulty, 
               created_at, is_multiplayer, room_id)

-- Достижения
achievements (id, user_id, achievement_type, unlocked_at, progress)

-- Комнаты для мультиплеера
multiplayer_rooms (id, name, max_players, current_players, status, 
                   created_by, created_at, started_at, finished_at)

-- Участники комнат
room_participants (room_id, user_id, joined_at, final_score, final_rank)

-- Лидерборды (кэш)
leaderboards (id, type, period, data, updated_at)

-- Друзья
friendships (user1_id, user2_id, created_at, status)
```

## � Экономическая система и монетизация

### 🎯 Игровая экономика
```typescript
interface GameEconomy {
  // Основные валюты
  volts: number;           // Основная игровая валюта
  premiumVolts: number;    // Премиум валюта (покупается за реальные деньги)
  energy: number;          // Энергия для игр (восстанавливается со временем)
  
  // Предметы и улучшения
  outletSkins: OutletSkin[];      // Скины для розеток
  backgroundThemes: Theme[];       // Темы оформления
  powerUps: PowerUp[];            // Временные усиления
  boosts: Boost[];                // Постоянные улучшения
}

interface OutletSkin {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: { volts?: number; premiumVolts?: number };
  effects?: VisualEffect[];
  unlockCondition?: Achievement;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  duration: number;        // В секундах
  effect: PowerUpEffect;
  price: { volts: number; premiumVolts?: number };
}

interface PowerUpEffect {
  scoreMultiplier?: number;    // Множитель очков
  shockProtection?: number;    // Снижение вероятности удара током
  energyReduction?: number;    // Снижение затрат энергии
  experienceBonus?: number;    // Бонус к опыту
}
```

### 🛒 Магазин и покупки
```typescript
interface ShopItem {
  id: string;
  type: 'skin' | 'theme' | 'powerup' | 'boost' | 'energy' | 'premium_volts';
  name: string;
  description: string;
  price: ItemPrice;
  availability: ShopAvailability;
  previewImage?: string;
}

interface ItemPrice {
  volts?: number;
  premiumVolts?: number;
  realMoney?: {
    amount: number;
    currency: 'USD' | 'EUR' | 'RUB';
  };
}

interface ShopAvailability {
  isLimited: boolean;
  endDate?: Date;
  requiredLevel?: number;
  requiredAchievement?: string;
}
```

### 💳 Система платежей
- **Telegram Stars** - официальная валюта Telegram для Mini Apps
- **Crypto платежи** - TON, USDT через TON Wallet
- **Traditional payments** - через Stripe/PayPal для веб-версии
- **In-app purchases** - для мобильных версий

### 🎁 Монетизационные механики
1. **Battle Pass** - сезонная система наград
2. **Daily/Weekly offers** - ограниченные предложения
3. **Gacha система** - случайные награды за премиум валюту
4. **VIP подписка** - ежемесячные преимущества
5. **Tournament entry fees** - платные турниры с большими призами

## 📺 Рекламная система и маркетинг

### 🎥 Интеграция рекламы
```typescript
interface AdSystem {
  rewardedAds: RewardedAd[];      // Реклама за награды
  interstitialAds: InterstitialAd[]; // Полноэкранная реклама
  bannerAds: BannerAd[];          // Баннерная реклама
  sponsoredContent: SponsoredContent[]; // Спонсорский контент
}

interface RewardedAd {
  id: string;
  provider: 'AdMob' | 'Unity' | 'Facebook' | 'Yandex';
  reward: AdReward;
  cooldown: number;               // Время между показами
  dailyLimit: number;             // Лимит в день
  targetingParams: AdTargeting;
}

interface AdReward {
  type: 'volts' | 'energy' | 'powerup' | 'lives' | 'premium_volts';
  amount: number;
  multiplier?: number;            // Для особых событий
}

interface AdTargeting {
  userLevel?: number[];
  gameMode?: string[];
  timeOfDay?: string[];
  userSegment?: 'new' | 'casual' | 'hardcore' | 'paying';
}
```

### 📊 Рекламные механики
1. **Reward Videos** - просмотр рекламы за:
   - Дополнительные вольты (2x reward)
   - Восстановление энергии
   - Бесплатные power-ups
   - Дополнительные жизни в турнирах

2. **Sponsored Challenges** - брендированные челленджи:
   - Специальные события от партнеров
   - Уникальные награды с логотипами брендов
   - Интеграция продуктов в игровой процесс

3. **Influencer Integration** - система для стримеров:
   - Реферальные коды
   - Специальные турниры для подписчиков
   - Кастомные скины для стримеров

### 🎯 Маркетинговые фичи
```typescript
interface MarketingSystem {
  referralProgram: ReferralProgram;
  socialSharing: SocialSharing;
  influencerTools: InfluencerTools;
  eventMarketing: EventMarketing;
}

interface ReferralProgram {
  referrerReward: { volts: number; premiumVolts?: number };
  refereeReward: { volts: number; premiumVolts?: number };
  milestoneRewards: MilestoneReward[];
  trackingSystem: ReferralTracking;
}

interface SocialSharing {
  shareButtons: SharePlatform[];
  achievementSharing: boolean;
  scoreSharing: boolean;
  customMessages: ShareMessage[];
}

interface InfluencerTools {
  customCodes: boolean;
  analyticsAccess: boolean;
  specialEvents: boolean;
  brandedContent: boolean;
}
```

## 📈 Аналитика и Data-Driven подход

### 💹 Экономические метрики
- **ARPU** (Average Revenue Per User)
- **ARPPU** (Average Revenue Per Paying User)
- **Conversion Rate** - % игроков, совершающих покупки
- **LTV** (Lifetime Value) - жизненная ценность игрока
- **Retention по платящим пользователям**
- **Churn rate** - отток пользователей

### 📊 Рекламные метрики
- **Ad Revenue Per User** - доход с рекламы на пользователя
- **Fill Rate** - процент успешных показов рекламы
- **eCPM** (effective Cost Per Mille) - эффективная стоимость за 1000 показов
- **Click-Through Rate** - процент кликов по рекламе
- **Completion Rate** - процент досмотров video ads

### 🎯 A/B тестирование
```typescript
interface ABTest {
  id: string;
  name: string;
  type: 'pricing' | 'ad_placement' | 'shop_layout' | 'reward_balance';
  variants: ABTestVariant[];
  metrics: string[];
  duration: number;
  userSegments: string[];
}

interface ABTestVariant {
  id: string;
  name: string;
  trafficAllocation: number; // В процентах
  config: Record<string, any>;
}
```

## �🔧 API расширения для экономики

### 💰 Экономические эндпоинты
```
GET /api/economy/balance - Получить баланс пользователя
POST /api/economy/purchase - Совершить покупку
GET /api/economy/shop - Получить содержимое магазина
POST /api/economy/gift - Подарить предмет другу

GET /api/ads/available - Получить доступную рекламу
POST /api/ads/watch - Зафиксировать просмотр рекламы
POST /api/ads/claim - Получить награду за рекламу

GET /api/referrals/stats - Статистика реферальной программы
POST /api/referrals/claim - Получить награду за реферала
```

### 📊 Аналитические эндпоинты
```
GET /api/analytics/revenue - Статистика доходов
GET /api/analytics/conversion - Конверсионные воронки
POST /api/analytics/event - Отправить аналитическое событие
GET /api/analytics/segments - Сегментация пользователей
```

### 🏆 Система рейтинга
- ELO рейтинг для ранкед игр
- Seasonal reset каждые 3 месяца
- Бонусы за streak побед

### 🎯 Matchmaking
- Подбор по рейтингу (±200 пунктов)
- Учет времени ожидания (расширение диапазона)
- Региональные предпочтения

### 🛡️ Анти-чит система
- Валидация скорости кликов (максимум 20 CPS)
- Проверка времени реакции
- Статистический анализ результатов
- Система репортов игроков

## 📊 Аналитика и метрики

### Ключевые метрики для отслеживания
- DAU/MAU (Daily/Monthly Active Users)
- Среднее время сессии
- Retention rate (1, 7, 30 дней)
- Конверсия в многопользовательские режимы
- Популярность различных режимов игры

### События для аналитики
```typescript
interface AnalyticsEvent {
  userId: number;
  event: 'game_started' | 'game_finished' | 'multiplayer_joined' | 
          'achievement_unlocked' | 'level_up' | 'friend_added';
  properties: Record<string, any>;
  timestamp: Date;
}
```

## 🚀 Этапы разработки

### Phase 1: Основа (2-3 недели)
1. Настройка сервера и базы данных
2. Система аутентификации Telegram
3. Базовые API эндпоинты
4. Интеграция с существующим фронтендом
5. **Базовая экономическая система** (volts, energy)

### Phase 2: Мультиплеер (2-3 недели)
1. WebSocket соединения
2. Система комнат
3. Real-time игры 1v1
4. Базовый лидерборд
5. **Простые награды за победы**

### Phase 3: Социальные функции (2-3 недели)
1. Система друзей
2. Вызовы между игроками
3. Расширенная статистика
4. Достижения
5. **Реферальная программа**

### Phase 4: Экономика и монетизация (3-4 недели)
1. **Магазин и система покупок**
2. **Интеграция с Telegram Stars**
3. **Reward видео реклама**
4. **Battle Pass система**
5. **A/B тестирование цен**

### Phase 5: Продвинутые функции (2-3 недели)
1. Турнирная система
2. Глобальные челленджи
3. **Influencer tools**
4. **Спонсорские события**
5. Оптимизация производительности

### Phase 6: Аналитика и оптимизация (1-2 недели)
1. **Продвинутая аналитика доходов**
2. **Retention analysis**
3. **Conversion optimization**
4. **Ad revenue optimization**

## 🔒 Безопасность и масштабируемость

### 🔐 Безопасность
- HTTPS только
- Валидация всех входных данных
- SQL injection protection
- Rate limiting (100 requests/minute per user)
- CORS настройки для Telegram Mini Apps
- **Правильная настройка .gitignore** (см. ниже)

### 📁 Критически важный .gitignore
```gitignore
# Переменные окружения и секреты
.env
.env.local
.env.development
.env.test
.env.production
*.env

# Конфигурация базы данных
database.json
db.json
*.db
*.sqlite
*.sqlite3

# API ключи и токены
config/secrets.js
config/keys.js
secrets/
keys/
*.pem
*.key
*.crt

# Логи
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Кэш и временные файлы
node_modules/
dist/
build/
.cache/
tmp/
temp/

# IDE файлы
.vscode/settings.json
.idea/
*.swp
*.swo

# Системные файлы
.DS_Store
Thumbs.db

# Backup файлы
*.backup
*.bak
*.old

# Deployment скрипты с секретами
deploy-secrets.sh
production-deploy.js
```

### ⚠️ Что НИКОГДА не должно попасть в Git:
1. **Telegram Bot Token** - всегда в переменных окружения
2. **Database credentials** - пароли БД только в .env
3. **JWT secrets** - ключи для подписи токенов
4. **API keys** сторонних сервисов (Stripe, AdMob, etc.)
5. **Private keys** для подписи транзакций TON
6. **Production конфигурация** с реальными данными

### 🔑 Управление секретами
```typescript
// ❌ НЕПРАВИЛЬНО - секреты в коде
const config = {
  botToken: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
  dbPassword: "mySecretPassword123"
};

// ✅ ПРАВИЛЬНО - через переменные окружения
const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  dbPassword: process.env.DATABASE_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY
};
```

### 🌍 Переменные окружения (.env файл)
```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=random_secret_string

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tigerrozetka
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# External APIs
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMOB_APP_ID=ca-app-pub-...

# Environment
NODE_ENV=development
PORT=3000
CORS_ORIGIN=https://orspiritus.github.io

# Analytics
ANALYTICS_API_KEY=your_analytics_key
SENTRY_DSN=https://...@sentry.io/...
```

### Масштабируемость
- Horizontal scaling для API серверов
- Redis для сессий и кэширования
- Database connection pooling
- CDN для статических ресурсов
- Load balancing

## 📝 Дополнительные требования

### 🔐 Безопасность репозитория
- **Настройка .gitignore** - никогда не коммитить секреты
- **Environment variables** - все конфиденциальные данные в .env
- **Git hooks** - pre-commit проверки на секреты
- **Secrets scanning** - GitHub/GitLab security features
- **Code review** - обязательная проверка всех изменений

### 🔧 Интеграция с фронтендом
- Минимальные изменения в существующем коде
- Обратная совместимость с одиночным режимом
- Graceful degradation при недоступности сервера

### Мониторинг
- Health checks для всех сервисов
- Логирование ошибок (Sentry или аналог)
- Метрики производительности
- Алерты для критических ошибок

### 📚 Документация
- OpenAPI/Swagger документация для API
- README с инструкциями по развертыванию
- **SECURITY.md** - гайд по безопасной настройке
- **Environment setup guide** - настройка переменных окружения
- Архитектурная диаграмма
- Примеры интеграции

## 🎯 Цели проекта

**Основная цель**: Создать engaging многопользовательский опыт, который увеличит retention и время в игре.

**Метрики успеха**:
- 30%+ пользователей пробуют мультиплеер в первую неделю
- 60%+ retention на 7 день после добавления друзей
- Среднее время сессии увеличивается на 40%
- 20%+ пользователей возвращаются для участия в турнирах

---

*Этот промпт содержит все необходимые детали для создания полноценной многопользовательской платформы для TigerRozetka с фокусом на социальное взаимодействие и соревновательность.*
