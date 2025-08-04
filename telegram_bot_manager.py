"""
Telegram Bot Manager для TigerRozetka
Управление подписчиками бота и система дуэлей
"""

import asyncio
import json
import sqlite3
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import aiohttp
from telegram import Bot, Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Конфигурация
BOT_TOKEN = os.getenv('VITE_TELEGRAM_BOT_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN', '')
WEBHOOK_SECRET = os.getenv('TELEGRAM_WEBHOOK_SECRET', 'your_webhook_secret')
DATABASE_PATH = 'bot_users.db'
BACKEND_API_URL = 'http://localhost:3001'

class TelegramBotManager:
    def __init__(self):
        self.bot = Bot(token=BOT_TOKEN)
        self.init_database()
    
    def init_database(self):
        """Инициализация базы данных пользователей"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Таблица активных пользователей бота
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bot_users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                is_active BOOLEAN DEFAULT 1,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                level INTEGER DEFAULT 1,
                total_games INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Таблица активных дуэлей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS active_duels (
                id TEXT PRIMARY KEY,
                player1_id INTEGER,
                player2_id INTEGER,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                game_data TEXT,
                FOREIGN KEY (player1_id) REFERENCES bot_users (user_id),
                FOREIGN KEY (player2_id) REFERENCES bot_users (user_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def register_user(self, user_id: int, username: str = None, 
                           first_name: str = None, last_name: str = None):
        """Регистрация нового пользователя"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO bot_users 
            (user_id, username, first_name, last_name, last_seen)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, username, first_name, last_name, datetime.now()))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Пользователь зарегистрирован: {first_name} (@{username})")
    
    async def get_active_users(self, exclude_user_id: int = None) -> List[Dict]:
        """Получение списка активных пользователей для дуэлей"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Пользователи, которые были активны в последние 7 дней
        week_ago = datetime.now() - timedelta(days=7)
        
        query = '''
            SELECT user_id, username, first_name, last_name, level, total_games, wins
            FROM bot_users 
            WHERE is_active = 1 AND last_seen > ?
        '''
        params = [week_ago]
        
        if exclude_user_id:
            query += ' AND user_id != ?'
            params.append(exclude_user_id)
        
        query += ' ORDER BY level DESC, wins DESC LIMIT 20'
        
        cursor.execute(query, params)
        users = []
        
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'username': row[1],
                'firstName': row[2],
                'lastName': row[3],
                'level': row[4],
                'totalGames': row[5],
                'wins': row[6]
            })
        
        conn.close()
        return users
    
    async def create_duel_invite(self, from_user_id: int, to_user_id: int) -> str:
        """Создание приглашения на дуэль"""
        import uuid
        
        duel_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(minutes=5)
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO active_duels (id, player1_id, player2_id, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (duel_id, from_user_id, to_user_id, expires_at))
        
        conn.commit()
        conn.close()
        
        # Отправляем уведомление получателю
        await self.send_duel_notification(from_user_id, to_user_id, duel_id)
        
        return duel_id
    
    async def send_duel_notification(self, from_user_id: int, to_user_id: int, duel_id: str):
        """Отправка уведомления о дуэли"""
        # Получаем информацию об отправителе
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT first_name, level FROM bot_users WHERE user_id = ?', (from_user_id,))
        sender_info = cursor.fetchone()
        conn.close()
        
        if sender_info:
            sender_name = sender_info[0]
            sender_level = sender_info[1]
            
            message = f"""🎮⚔️ ВЫЗОВ НА ДУЭЛЬ!

{sender_name} (Уровень {sender_level}) вызывает вас на дуэль в TigerRozetka!

⚡ Игра на 60 секунд
🏆 Кто наберет больше очков - тот победил!
⏰ У вас есть 5 минут, чтобы ответить

Принять вызов?"""

            # Клавиатура с кнопками
            from telegram import InlineKeyboardButton, InlineKeyboardMarkup
            keyboard = [
                [
                    InlineKeyboardButton("✅ Принять дуэль", callback_data=f"accept_duel:{duel_id}"),
                    InlineKeyboardButton("❌ Отклонить", callback_data=f"decline_duel:{duel_id}")
                ],
                [InlineKeyboardButton("🎮 Открыть игру", url="https://orspiritus.github.io/tigerrosette/")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            try:
                await self.bot.send_message(
                    chat_id=to_user_id,
                    text=message,
                    reply_markup=reply_markup
                )
                print(f"📤 Уведомление о дуэли отправлено: {to_user_id}")
            except Exception as e:
                print(f"❌ Ошибка отправки уведомления: {e}")
    
    async def handle_duel_response(self, user_id: int, duel_id: str, accepted: bool):
        """Обработка ответа на приглашение дуэли"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Проверяем что дуэль существует и не истекла
        cursor.execute('''
            SELECT player1_id, player2_id, expires_at, status 
            FROM active_duels 
            WHERE id = ? AND player2_id = ?
        ''', (duel_id, user_id))
        
        duel = cursor.fetchone()
        
        if not duel:
            await self.bot.send_message(user_id, "❌ Приглашение не найдено или недействительно")
            return
        
        player1_id, player2_id, expires_at, status = duel
        
        # Проверяем срок действия
        if datetime.fromisoformat(expires_at) < datetime.now():
            cursor.execute('DELETE FROM active_duels WHERE id = ?', (duel_id,))
            conn.commit()
            conn.close()
            await self.bot.send_message(user_id, "⏰ Время для ответа истекло")
            return
        
        if accepted:
            # Принятие дуэли
            cursor.execute(
                'UPDATE active_duels SET status = ? WHERE id = ?',
                ('accepted', duel_id)
            )
            conn.commit()
            
            # Уведомляем обоих игроков
            game_url = f"https://orspiritus.github.io/tigerrosette/?duel={duel_id}"
            
            await self.bot.send_message(
                player1_id,
                f"✅ Ваш вызов принят! Дуэль начинается!\n\n🎮 Открыть игру: {game_url}"
            )
            await self.bot.send_message(
                player2_id,
                f"⚔️ Дуэль принята! Удачи!\n\n🎮 Открыть игру: {game_url}"
            )
            
            # Отправляем данные в backend для синхронизации
            await self.notify_backend_duel_start(duel_id, player1_id, player2_id)
            
        else:
            # Отклонение дуэли
            cursor.execute('DELETE FROM active_duels WHERE id = ?', (duel_id,))
            conn.commit()
            
            await self.bot.send_message(player1_id, "❌ Ваш вызов на дуэль отклонен")
            await self.bot.send_message(user_id, "❌ Вы отклонили приглашение на дуэль")
        
        conn.close()
    
    async def notify_backend_duel_start(self, duel_id: str, player1_id: int, player2_id: int):
        """Уведомление backend о начале дуэли"""
        try:
            async with aiohttp.ClientSession() as session:
                data = {
                    'duelId': duel_id,
                    'player1Id': player1_id,
                    'player2Id': player2_id,
                    'status': 'started'
                }
                
                async with session.post(f'{BACKEND_API_URL}/api/duels/start', json=data) as response:
                    if response.status == 200:
                        print(f"✅ Backend уведомлен о дуэли: {duel_id}")
                    else:
                        print(f"⚠️ Ошибка уведомления backend: {response.status}")
        except Exception as e:
            print(f"❌ Ошибка связи с backend: {e}")
    
    async def cleanup_expired_duels(self):
        """Очистка истекших дуэлей"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM active_duels WHERE expires_at < ?', (datetime.now(),))
        deleted = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if deleted > 0:
            print(f"🧹 Удалено истекших дуэлей: {deleted}")

# Создаем экземпляр менеджера
bot_manager = TelegramBotManager()

# Обработчики команд
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    user = update.effective_user
    
    await bot_manager.register_user(
        user.id, user.username, user.first_name, user.last_name
    )
    
    welcome_message = f"""🐅⚡ Добро пожаловать в TigerRozetka, {user.first_name}!

Опасная игра с электричеством ждет вас!

🎮 Команды:
/play - Начать игру
/duel - Найти соперника для дуэли  
/stats - Ваша статистика
/help - Помощь

🚀 Или нажмите кнопку ниже, чтобы играть прямо сейчас!"""
    
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup
    keyboard = [[InlineKeyboardButton("🎮 Играть в TigerRozetka", url="https://orspiritus.github.io/tigerrosette/")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)

async def duel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /duel"""
    user_id = update.effective_user.id
    users = await bot_manager.get_active_users(exclude_user_id=user_id)
    
    if not users:
        await update.message.reply_text("😔 Нет доступных игроков для дуэли. Пригласите друзей в бота!")
        return
    
    message = "⚔️ Доступные игроки для дуэли:\n\n"
    
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup
    keyboard = []
    
    for user in users[:10]:  # Максимум 10 игроков
        name = user['firstName']
        if user['lastName']:
            name += f" {user['lastName']}"
        if user['username']:
            name += f" (@{user['username']})"
        
        message += f"👤 {name} - Уровень {user['level']}\n"
        message += f"   🏆 Побед: {user['wins']}/{user['totalGames']}\n\n"
        
        button_text = f"⚔️ Вызвать {user['firstName']}"
        callback_data = f"challenge:{user['id']}"
        keyboard.append([InlineKeyboardButton(button_text, callback_data=callback_data)])
    
    keyboard.append([InlineKeyboardButton("🎮 Открыть игру", url="https://orspiritus.github.io/tigerrosette/")])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(message, reply_markup=reply_markup)

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /stats"""
    user_id = update.effective_user.id
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT level, total_games, wins, losses 
        FROM bot_users 
        WHERE user_id = ?
    ''', (user_id,))
    
    stats = cursor.fetchone()
    conn.close()
    
    if stats:
        level, total_games, wins, losses = stats
        win_rate = (wins / total_games * 100) if total_games > 0 else 0
        
        message = f"""📊 Ваша статистика:

⚡ Уровень: {level}
🎮 Всего игр: {total_games}
🏆 Побед: {wins}
💀 Поражений: {losses}
📈 Процент побед: {win_rate:.1f}%

🎯 Продолжайте играть, чтобы повысить уровень!"""
    else:
        message = "📊 У вас пока нет статистики. Начните играть!"
    
    keyboard = [[InlineKeyboardButton("🎮 Играть", url="https://orspiritus.github.io/tigerrosette/")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(message, reply_markup=reply_markup)

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик callback кнопок"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    user_id = query.from_user.id
    
    if data.startswith('challenge:'):
        # Вызов на дуэль
        target_user_id = int(data.split(':')[1])
        duel_id = await bot_manager.create_duel_invite(user_id, target_user_id)
        await query.edit_message_text("⚔️ Приглашение на дуэль отправлено! Ожидайте ответа...")
        
    elif data.startswith('accept_duel:'):
        # Принятие дуэли
        duel_id = data.split(':')[1]
        await bot_manager.handle_duel_response(user_id, duel_id, True)
        await query.edit_message_text("✅ Дуэль принята! Переходите в игру.")
        
    elif data.startswith('decline_duel:'):
        # Отклонение дуэли
        duel_id = data.split(':')[1]
        await bot_manager.handle_duel_response(user_id, duel_id, False)
        await query.edit_message_text("❌ Дуэль отклонена.")

# API эндпоинты для интеграции с frontend
async def get_available_players(user_id: int) -> List[Dict]:
    """API функция для получения доступных игроков"""
    return await bot_manager.get_active_users(exclude_user_id=user_id)

async def create_duel_challenge(from_user_id: int, to_user_id: int) -> str:
    """API функция для создания вызова на дуэль"""
    return await bot_manager.create_duel_invite(from_user_id, to_user_id)

# Фоновая задача очистки
async def cleanup_task():
    """Фоновая задача для очистки истекших дуэлей"""
    while True:
        await bot_manager.cleanup_expired_duels()
        await asyncio.sleep(60)  # Каждую минуту

def main():
    """Запуск бота"""
    if not BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN не установлен!")
        return
    
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("duel", duel_command))
    application.add_handler(CommandHandler("stats", stats_command))
    application.add_handler(MessageHandler(filters.ALL, lambda update, context: bot_manager.register_user(
        update.effective_user.id, update.effective_user.username, 
        update.effective_user.first_name, update.effective_user.last_name
    )))
    
    from telegram.ext import CallbackQueryHandler
    application.add_handler(CallbackQueryHandler(callback_handler))
    
    print("🚀 TigerRozetka Bot запущен!")
    print("📱 Доступные команды: /start, /duel, /stats")
    
    # Запускаем фоновую очистку
    loop = asyncio.get_event_loop()
    loop.create_task(cleanup_task())
    
    # Запускаем бота
    application.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
