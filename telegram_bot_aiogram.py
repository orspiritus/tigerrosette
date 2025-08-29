# -*- coding: utf-8 -*-
"""
TigerRozetka Telegram Bot - aiogram версия (окончательно исправленная)
Современная система дуэлей и управления подписчиками
"""

import asyncio
import json
import sqlite3
import os
import uuid
from typing import List, Dict, Optional, Any, TYPE_CHECKING
from datetime import datetime, timedelta

# Проверка зависимостей с защитой от ошибок импорта
try:
    import aiohttp
    from aiogram import Bot, Dispatcher, Router, F
    from aiogram.types import (
        Message, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup,
        BotCommand, WebAppInfo
    )
    from aiogram.filters import CommandStart, Command
    from aiogram.fsm.context import FSMContext
    from aiogram.fsm.state import State, StatesGroup
    from aiogram.fsm.storage.memory import MemoryStorage
    from dotenv import load_dotenv
    IMPORTS_OK = True
    print("✅ Все зависимости загружены успешно")
except ImportError as e:
    print(f"⚠️  Некоторые зависимости не установлены: {e}")
    print("📦 Запустите: pip install aiogram aiohttp python-dotenv")
    IMPORTS_OK = False
    # Минимальные заглушки чтобы убрать 'possibly unbound' (используются только если нет зависимостей)
    if TYPE_CHECKING:  # pragma: no cover
        from aiogram import Bot, Dispatcher, Router  # type: ignore
        from aiogram.types import Message, CallbackQuery  # type: ignore
        from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, BotCommand, WebAppInfo  # type: ignore
        from aiogram.filters import CommandStart, Command  # type: ignore
        from aiogram.fsm.state import State, StatesGroup  # type: ignore
        from aiogram.fsm.storage.memory import MemoryStorage  # type: ignore
    aiohttp = None  # type: ignore

# Загрузка конфигурации (безопасно, чтобы не было 'possibly unbound')
if IMPORTS_OK:
    try:  # type: ignore[misc]
        load_dotenv()  # type: ignore
    except Exception:
        pass

# Конфигурация
BOT_TOKEN = os.getenv('VITE_TELEGRAM_BOT_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN', '')
DATABASE_PATH = 'bot_users.db'
BACKEND_API_URL = 'http://localhost:3001'
GAME_URL = 'https://orspiritus.github.io/tigerrosette/'

# FSM состояния для дуэлей
if IMPORTS_OK:
    class DuelStates(StatesGroup):  # type: ignore
        selecting_opponent = State()  # type: ignore
        waiting_response = State()    # type: ignore
        in_game = State()             # type: ignore
else:
    class DuelStates:  # type: ignore
        selecting_opponent = object()
        waiting_response = object()
        in_game = object()

class TigerRozetkaBotManager:
    def __init__(self):
        self.init_database()

    def init_database(self):
        """Инициализация базы данных"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Таблица пользователей бота
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
        print("✅ База данных инициализирована")

# Создаем экземпляр менеджера
bot_manager = TigerRozetkaBotManager()

# Функции для работы с базой данных
async def register_user(user_id: int, username: Optional[str] = None, 
                       first_name: Optional[str] = None, last_name: Optional[str] = None):
    """Регистрация/обновление пользователя"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO bot_users 
        (user_id, username, first_name, last_name, last_seen)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, username, first_name, last_name, datetime.now()))
    
    conn.commit()
    conn.close()

async def get_active_players(exclude_user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Получение активных игроков для дуэлей"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    week_ago = datetime.now() - timedelta(days=7)
    
    query = '''
        SELECT user_id, username, first_name, last_name, level, total_games, wins
        FROM bot_users 
        WHERE is_active = 1 AND last_seen > ?
    '''
    params: List[Any] = [week_ago]
    
    if exclude_user_id:
        query += ' AND user_id != ?'
        params.append(exclude_user_id)
    
    query += ' ORDER BY level DESC, wins DESC LIMIT 20'
    
    cursor.execute(query, params)
    players = []
    
    for row in cursor.fetchall():
        players.append({
            'id': row[0],
            'username': row[1],
            'firstName': row[2],
            'lastName': row[3],
            'level': row[4],
            'totalGames': row[5],
            'wins': row[6]
        })
    
    conn.close()
    return players

async def get_user_stats(user_id: int) -> Optional[Dict[str, Any]]:
    """Получение статистики пользователя"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT level, total_games, wins, losses 
        FROM bot_users 
        WHERE user_id = ?
    ''', (user_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            'level': result[0],
            'total_games': result[1],
            'wins': result[2],
            'losses': result[3]
        }
    return None

async def create_duel(from_user_id: int, to_user_id: int) -> str:
    """Создание новой дуэли"""
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
    
    return duel_id

async def get_duel_info(duel_id: str) -> Optional[Dict[str, Any]]:
    """Получение информации о дуэли"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT player1_id, player2_id, status, expires_at
        FROM active_duels 
        WHERE id = ?
    ''', (duel_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            'player1_id': result[0],
            'player2_id': result[1],
            'status': result[2],
            'expires_at': result[3]
        }
    return None

async def update_duel_status(duel_id: str, status: str):
    """Обновление статуса дуэли"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE active_duels SET status = ? WHERE id = ?',
        (status, duel_id)
    )
    
    conn.commit()
    conn.close()

async def cleanup_expired_duels():
    """Очистка истекших дуэлей"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM active_duels WHERE expires_at < datetime("now")')
    deleted = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    if deleted > 0:
        print(f"🧹 Удалено истекших дуэлей: {deleted}")

# Инициализация бота и обработчиков (только если все зависимости доступны)
if IMPORTS_OK:
    # Создаем бота и диспетчер
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())
    main_router = Router()

    # Middleware для автоматической регистрации пользователей
    async def user_registration_middleware(handler, event, data):
        """Middleware для автоматической регистрации пользователей"""
        if hasattr(event, 'from_user') and event.from_user:
            user = event.from_user
            await register_user(
                user.id, user.username, user.first_name, user.last_name
            )
        return await handler(event, data)

    # Команда /start
    @main_router.message(CommandStart())  # type: ignore[arg-type]
    async def start_handler(message: "Message"):
        """Обработчик команды /start"""
        if not message.from_user:
            return
        user = message.from_user
        await register_user(user.id, user.username, user.first_name, user.last_name)
        
        welcome_text = f"""🐅⚡ Добро пожаловать в TigerRozetka, {user.first_name}!

Опасная игра с электричеством ждет вас!

🎮 Команды:
/play - Начать игру
/duel - Найти соперника для дуэли  
/stats - Ваша статистика
/help - Помощь

🚀 Нажмите кнопку ниже, чтобы играть!"""

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="🎮 Играть в TigerRozetka", 
                web_app=WebAppInfo(url=GAME_URL)
            )],
            [InlineKeyboardButton(
                text="⚔️ Дуэли", 
                callback_data="duel_menu"
            )]
        ])
        
        await message.answer(welcome_text, reply_markup=keyboard)

    # Команда /play
    @main_router.message(Command("play"))  # type: ignore[arg-type]
    async def play_handler(message: "Message"):
        """Запуск игры"""
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="🎮 Играть в TigerRozetka", 
                web_app=WebAppInfo(url=GAME_URL)
            )]
        ])
        
        await message.answer(
            "🎮 Запускаем TigerRozetka!\n\n⚡ Осторожно: игра вызывает привыкание!",
            reply_markup=keyboard
        )

    # Команда /duel
    @main_router.message(Command("duel"))  # type: ignore[arg-type]
    async def duel_command_handler(message: "Message"):
        """Команда дуэли"""
        await show_duel_menu(message)

    async def show_duel_menu(message: "Message"):
        """Показать меню дуэлей"""
        if not message.from_user:
            return
        user_id = message.from_user.id
        players = await get_active_players(exclude_user_id=user_id)
        
        if not players:
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="🎮 Открыть игру", 
                    web_app=WebAppInfo(url=GAME_URL)
                )],
                [InlineKeyboardButton(
                    text="🔄 Обновить список", 
                    callback_data="refresh_players"
                )]
            ])
            
            await message.answer(
                "😔 Нет доступных игроков для дуэли.\n\n"
                "Пригласите друзей подписаться на бота!",
                reply_markup=keyboard
            )
            return
        
        text = "⚔️ Доступные игроки для дуэли:\n\n"
        keyboard_buttons = []
        
        for i, player in enumerate(players[:10]):  # Максимум 10 игроков
            name = player['firstName']
            if player['lastName']:
                name += f" {player['lastName']}"
            if player['username']:
                name += f" (@{player['username']})"
            
            text += f"{i+1}. {name}\n"
            text += f"   ⚡ Уровень {player['level']} • 🏆 {player['wins']}/{player['totalGames']}\n\n"
            
            keyboard_buttons.append([InlineKeyboardButton(
                text=f"⚔️ Вызвать {player['firstName']}", 
                callback_data=f"challenge:{player['id']}"
            )])
        
        # Добавляем кнопки управления
        keyboard_buttons.extend([
            [InlineKeyboardButton(text="🔄 Обновить", callback_data="refresh_players")],
            [InlineKeyboardButton(text="🎮 Открыть игру", web_app=WebAppInfo(url=GAME_URL))]
        ])
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
        await message.answer(text, reply_markup=keyboard)

    # Команда /stats
    @main_router.message(Command("stats"))  # type: ignore[arg-type]
    async def stats_handler(message: "Message"):
        """Показать статистику пользователя"""
        if not message.from_user:
            return
        user_id = message.from_user.id
        stats = await get_user_stats(user_id)
        
        if stats:
            win_rate = (stats['wins'] / stats['total_games'] * 100) if stats['total_games'] > 0 else 0
            
            text = f"""📊 Ваша статистика:

⚡ Уровень: {stats['level']}
🎮 Всего игр: {stats['total_games']}
🏆 Побед: {stats['wins']}
💀 Поражений: {stats['losses']}
📈 Процент побед: {win_rate:.1f}%

🎯 Продолжайте играть, чтобы повысить уровень!"""
        else:
            text = "📊 У вас пока нет статистики.\n\nНачните играть!"
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🎮 Играть", web_app=WebAppInfo(url=GAME_URL))],
            [InlineKeyboardButton(text="⚔️ Дуэли", callback_data="duel_menu")]
        ])
        
        await message.answer(text, reply_markup=keyboard)

    # Обработчики callback запросов
    @main_router.callback_query(F.data == "duel_menu")  # type: ignore[attr-defined]
    async def duel_menu_callback(callback: "CallbackQuery"):
        """Показать меню дуэлей из callback"""
        await callback.answer()
        if callback.message:
            await show_duel_menu(callback.message)  # type: ignore[arg-type]

    @main_router.callback_query(F.data == "refresh_players")  # type: ignore[attr-defined]
    async def refresh_players_callback(callback: "CallbackQuery"):
        """Обновить список игроков"""
        await callback.answer("🔄 Обновляем список...")
        if callback.message:
            await show_duel_menu(callback.message)  # type: ignore[arg-type]

    @main_router.callback_query(F.data.startswith("challenge:"))  # type: ignore[attr-defined]
    async def challenge_callback(callback: "CallbackQuery"):
        """Отправить вызов на дуэль"""
        await callback.answer()
        if not callback.data or not callback.from_user:
            return
        if callback.message is None:
            return
        target_user_id = int(callback.data.split(":")[1])
        challenger_id = callback.from_user.id
        
        # Создаем дуэль
        duel_id = await create_duel(challenger_id, target_user_id)
        
        # Отправляем уведомление получателю
        await send_duel_notification(target_user_id, challenger_id, duel_id)
        
        # Уведомляем отправителя
        if callback.message is not None and hasattr(callback.message, 'edit_text'):
            msg_any: Any = callback.message
            await msg_any.edit_text(
            "⚔️ Приглашение на дуэль отправлено!\n\n"
            "⏰ Ожидайте ответа в течение 5 минут...",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🔙 Назад к списку", callback_data="duel_menu")]
            ])
            )

    async def send_duel_notification(to_user_id: int, from_user_id: int, duel_id: str):
        """Отправка уведомления о дуэли"""
        try:
            # Получаем информацию об отправителе
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute(
                'SELECT first_name, level FROM bot_users WHERE user_id = ?', 
                (from_user_id,)
            )
            sender_info = cursor.fetchone()
            conn.close()
            
            if sender_info:
                sender_name, sender_level = sender_info
                
                text = f"""🎮⚔️ ВЫЗОВ НА ДУЭЛЬ!

{sender_name} (Уровень {sender_level}) вызывает вас на дуэль в TigerRozetka!

⚡ Игра на 60 секунд
🏆 Кто наберет больше очков - тот победил!
⏰ У вас есть 5 минут, чтобы ответить

Принять вызов?"""

                keyboard = InlineKeyboardMarkup(inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="✅ Принять дуэль", 
                            callback_data=f"accept_duel:{duel_id}"
                        ),
                        InlineKeyboardButton(
                            text="❌ Отклонить", 
                            callback_data=f"decline_duel:{duel_id}"
                        )
                    ],
                    [InlineKeyboardButton(
                        text="🎮 Открыть игру", 
                        web_app=WebAppInfo(url=GAME_URL)
                    )]
                ])
                
                await bot.send_message(to_user_id, text, reply_markup=keyboard)
                print(f"📤 Уведомление о дуэли отправлено: {to_user_id}")
                
        except Exception as e:
            print(f"❌ Ошибка отправки уведомления: {e}")

    @main_router.callback_query(F.data.startswith("accept_duel:"))  # type: ignore[attr-defined]
    async def accept_duel_callback(callback: "CallbackQuery"):
        """Принять дуэль"""
        await callback.answer()
        if not callback.data or not callback.from_user:
            return
        duel_id = callback.data.split(":")[1]
        user_id = callback.from_user.id  # noqa: F841
        
        duel_info = await get_duel_info(duel_id)
        
        if not duel_info:
            if callback.message and hasattr(callback.message, 'edit_text'):
                msg_any: Any = callback.message
                await msg_any.edit_text("❌ Приглашение не найдено или недействительно")
            return
        
        # Проверяем срок действия
        try:
            expires_at_raw = duel_info['expires_at']
            if isinstance(expires_at_raw, str):
                expires_at = datetime.fromisoformat(expires_at_raw)
            else:
                expires_at = expires_at_raw  # type: ignore
            if expires_at < datetime.now():
                if callback.message and hasattr(callback.message, 'edit_text'):
                    msg_any: Any = callback.message
                    await msg_any.edit_text("⏰ Время для ответа истекло")
                return
        except Exception:
            pass
        
        # Принимаем дуэль
        await update_duel_status(duel_id, 'accepted')
        
        # Уведомляем обоих игроков
        game_url_with_duel = f"{GAME_URL}?duel={duel_id}"
        
        duel_keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="🎮 Начать дуэль!", 
                web_app=WebAppInfo(url=game_url_with_duel)
            )]
        ])
        
        # Уведомляем инициатора
        await bot.send_message(
            duel_info['player1_id'],
            "✅ Ваш вызов принят! Дуэль начинается!\n\n"
            "🎮 Нажмите кнопку ниже для входа в игру:",
            reply_markup=duel_keyboard
        )
        
        # Уведомляем принявшего
        if callback.message and hasattr(callback.message, 'edit_text'):
            msg_any: Any = callback.message
            await msg_any.edit_text(
                "⚔️ Дуэль принята! Удачи!\n\n"
                "🎮 Нажмите кнопку ниже для входа в игру:",
                reply_markup=duel_keyboard
            )
        
        # Уведомляем backend
        await notify_backend_duel_start(duel_id, duel_info['player1_id'], duel_info['player2_id'])

    @main_router.callback_query(F.data.startswith("decline_duel:"))  # type: ignore[attr-defined]
    async def decline_duel_callback(callback: "CallbackQuery"):
        """Отклонить дуэль"""
        await callback.answer()
        if not callback.data:
            return
        duel_id = callback.data.split(":")[1]
        duel_info = await get_duel_info(duel_id)
        
        if duel_info:
            # Удаляем дуэль
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM active_duels WHERE id = ?', (duel_id,))
            conn.commit()
            conn.close()
            
            # Уведомляем инициатора
            await bot.send_message(
                duel_info['player1_id'],
                "❌ Ваш вызов на дуэль отклонен"
            )
        
        if callback.message and hasattr(callback.message, 'edit_text'):
            msg_any: Any = callback.message
            await msg_any.edit_text("❌ Вы отклонили приглашение на дуэль")

    async def notify_backend_duel_start(duel_id: str, player1_id: int, player2_id: int):
        """Уведомление backend о начале дуэли"""
        try:
            if aiohttp is None:  # type: ignore
                return
            async with aiohttp.ClientSession() as session:  # type: ignore[attr-defined]
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

    # API функции для интеграции с frontend
    async def api_get_available_players(user_id: int) -> List[Dict[str, Any]]:
        """API функция для получения доступных игроков"""
        return await get_active_players(exclude_user_id=user_id)

    async def api_create_duel_challenge(from_user_id: int, to_user_id: int) -> str:
        """API функция для создания вызова на дуэль"""
        duel_id = await create_duel(from_user_id, to_user_id)
        await send_duel_notification(to_user_id, from_user_id, duel_id)
        return duel_id

    # Фоновая задача очистки
    async def cleanup_task():
        """Фоновая задача для очистки истекших дуэлей"""
        while True:
            await cleanup_expired_duels()
            await asyncio.sleep(60)  # Каждую минуту

    # Настройка команд бота
    async def set_bot_commands():
        """Установка команд бота"""
        commands = [
            BotCommand(command="start", description="🚀 Запустить бота"),
            BotCommand(command="play", description="🎮 Играть в TigerRozetka"),
            BotCommand(command="duel", description="⚔️ Найти соперника для дуэли"),
            BotCommand(command="stats", description="📊 Моя статистика"),
        ]
        await bot.set_my_commands(commands)

    # Главная функция запуска
    async def main():
        """Запуск бота"""
        if not BOT_TOKEN:
            print("❌ BOT_TOKEN не установлен!")
            return
        
        # Регистрируем роутер
        dp.include_router(main_router)
        
        print("🚀 TigerRozetka Bot (aiogram) запускается...")
        
        # Устанавливаем команды
        await set_bot_commands()
        
        # Запускаем фоновую очистку
        asyncio.create_task(cleanup_task())
        
        print("✅ TigerRozetka Bot запущен!")
        print("📱 Команды бота: /start, /duel, /stats, /play")
        print("🔗 Backend API:  http://localhost:3001")
        print("🌐 Frontend:     http://localhost:5173")
        print("📱 Game URL:     https://orspiritus.github.io/tigerrosette/")
        print("")
        print("💡 Закройте все окна для остановки сервисов")
        print("")
        
        # Запускаем polling
        await dp.start_polling(bot, drop_pending_updates=True)

    if __name__ == '__main__':
        asyncio.run(main())
else:
    print("❌ Невозможно запустить бота без необходимых зависимостей")
    print("📦 Установите: pip install aiogram aiohttp python-dotenv")
    
    # Заглушка main функции для случая отсутствия зависимостей
    async def main():
        print("❌ Бот не может быть запущен без установленных зависимостей")
        
    if __name__ == '__main__':
        asyncio.run(main())
