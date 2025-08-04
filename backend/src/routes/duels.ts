import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Эндпоинт для получения доступных игроков для дуэлей
router.get('/players/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // В реальной версии здесь будет запрос к Python боту
    // Пока возвращаем тестовые данные
    const availablePlayers = [
      {
        id: 12345,
        firstName: 'Анна',
        lastName: 'Иванова', 
        username: 'anna_i',
        level: 8,
        totalGames: 15,
        wins: 12
      },
      {
        id: 54321,
        firstName: 'Михаил',
        lastName: 'Петров',
        username: 'mike_p', 
        level: 6,
        totalGames: 10,
        wins: 7
      },
      {
        id: 98765,
        firstName: 'Елена',
        username: 'lena_gamer',
        level: 10,
        totalGames: 25,
        wins: 20
      }
    ];
    
    // Исключаем текущего пользователя
    const filteredPlayers = availablePlayers.filter(p => p.id !== userId);
    
    res.json({
      success: true,
      players: filteredPlayers
    });
  } catch (error) {
    console.error('Ошибка получения игроков:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

// Эндпоинт для создания приглашения на дуэль
router.post('/invite', async (req, res) => {
  try {
    const { fromUserId, toUserId, message } = req.body;
    
    // Создаем уникальный ID дуэли
    const duelId = `duel_${Date.now()}_${fromUserId}_${toUserId}`;
    
    // В реальной версии здесь будет вызов Python бота через HTTP API
    // await callPythonBot('create_duel_invite', { fromUserId, toUserId, duelId });
    
    console.log(`📤 Приглашение на дуэль: ${fromUserId} → ${toUserId}`);
    console.log(`🆔 Duel ID: ${duelId}`);
    
    res.json({
      success: true,
      duelId,
      message: 'Приглашение отправлено'
    });
  } catch (error) {
    console.error('Ошибка создания приглашения:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отправки приглашения'
    });
  }
});

// Эндпоинт для начала дуэли (вызывается Python ботом)
router.post('/start', async (req, res) => {
  try {
    const { duelId, player1Id, player2Id, status } = req.body;
    
    console.log(`🎮 Дуэль начинается: ${duelId}`);
    console.log(`👥 Игроки: ${player1Id} vs ${player2Id}`);
    
    // Здесь можно сохранить информацию о дуэли в базу данных
    // await prisma.duel.create({
    //   data: {
    //     id: duelId,
    //     player1Id,
    //     player2Id,
    //     status: 'active'
    //   }
    // });
    
    res.json({
      success: true,
      message: 'Дуэль зарегистрирована'
    });
  } catch (error) {
    console.error('Ошибка регистрации дуэли:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка регистрации дуэли'
    });
  }
});

// Эндпоинт для завершения дуэли
router.post('/finish', async (req, res) => {
  try {
    const { duelId, winnerId, player1Score, player2Score } = req.body;
    
    console.log(`🏆 Дуэль завершена: ${duelId}`);
    console.log(`👑 Победитель: ${winnerId}`);
    console.log(`📊 Счет: ${player1Score} - ${player2Score}`);
    
    res.json({
      success: true,
      message: 'Результат дуэли сохранен'
    });
  } catch (error) {
    console.error('Ошибка завершения дуэли:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сохранения результата'
    });
  }
});

// Утилита для вызова Python бота (будущая реализация)
async function callPythonBot(action: string, data: any) {
  // В реальной версии здесь будет HTTP запрос к Python серверу
  // или использование Redis/очередей для коммуникации
  console.log(`🐍 Python Bot API: ${action}`, data);
}

export default router;
