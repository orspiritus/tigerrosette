"""
TigerRozetka Bot - Простая aiogram версия для тестирования
"""

import asyncio
import logging
import os
from aiogram import Bot, Dispatcher
from aiogram.types import Message
from aiogram.filters import CommandStart
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Токен бота
BOT_TOKEN = os.getenv('VITE_TELEGRAM_BOT_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN', '')

# Создаем бота и диспетчер
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def start_handler(message: Message):
    """Обработчик команды /start"""
    await message.answer(
        f"🐅⚡ Привет, {message.from_user.first_name}!\n\n"
        "TigerRozetka Bot (aiogram) работает!\n\n"
        "🎮 Скоро здесь будут дуэли!"
    )

@dp.message()
async def echo_handler(message: Message):
    """Эхо обработчик"""
    await message.answer(f"Вы написали: {message.text}")

async def main():
    """Главная функция"""
    if not BOT_TOKEN:
        print("❌ BOT_TOKEN не установлен!")
        return
    
    print("🚀 TigerRozetka Bot (aiogram) запускается...")
    print(f"📱 Token: {BOT_TOKEN[:10]}...")
    
    # Запускаем polling
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
