import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { hapticManager } from '../utils/hapticManager';
import { useDuelConnection } from '../hooks/useDuelConnection';

interface DuelPlayer {
  id: string;
  name: string;
  volts: number;
  level: number;
  isReady: boolean;
  isAlive: boolean;
  score: number;
  streak: number;
}

interface DuelState {
  status: 'connecting' | 'searching' | 'found' | 'ready' | 'countdown' | 'playing' | 'finished';
  timeLeft: number;
  winner: string | null;
  roundNumber: number;
  maxRounds: number;
}

export const DuelScreen: React.FC = () => {
  const { player, endGame } = useGameStore();
  const {
    isConnected,
    currentRoom,
    opponent: connectedOpponent,
    messages,
    connect,
    disconnect,
    findDuel,
    setReady,
    sendPlayerAction,
    sendPlayerShocked,
    leaveDuel,
    setOpponent
  } = useDuelConnection();

  const [duelState, setDuelState] = useState<DuelState>({
    status: 'connecting',
    timeLeft: 60,
    winner: null,
    roundNumber: 1,
    maxRounds: 3
  });

  const [playerState, setPlayerState] = useState<DuelPlayer>({
    id: player.id,
    name: player.name,
    volts: player.volts,
    level: player.level,
    isReady: false,
    isAlive: true,
    score: 0,
    streak: 0
  });

  const [countdownTimer, setCountdownTimer] = useState<number>(0);
  const [gameTimer, setGameTimer] = useState<number>(0);

  // Подключение к серверу при монтировании
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Обработка статуса подключения
  useEffect(() => {
    if (isConnected && duelState.status === 'connecting') {
      setDuelState(prev => ({ ...prev, status: 'searching' }));
      findDuel().then(() => {
        setDuelState(prev => ({ ...prev, status: 'found' }));
        hapticManager.medium();
      });
    }
  }, [isConnected, duelState.status, findDuel]);

  // Обработка входящих сообщений
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'player_ready':
        if (lastMessage.playerId !== player.id) {
          setOpponent((prev: DuelPlayer | null) => prev ? { ...prev, isReady: true } : null);
        }
        break;

      case 'player_action':
        if (lastMessage.playerId !== player.id && connectedOpponent) {
          const { points, volts } = lastMessage.data;
          setOpponent((prev: DuelPlayer | null) => prev ? {
            ...prev,
            score: prev.score + points,
            volts: prev.volts + volts,
            streak: prev.streak + 1
          } : null);
        }
        break;

      case 'player_shocked':
        if (lastMessage.playerId !== player.id && connectedOpponent) {
          const { damage } = lastMessage.data;
          setOpponent((prev: DuelPlayer | null) => prev ? {
            ...prev,
            volts: Math.max(0, prev.volts - damage),
            streak: 0
          } : null);
        }
        break;

      case 'game_start':
        setDuelState(prev => ({ ...prev, status: 'countdown' }));
        setCountdownTimer(3);
        break;

      case 'game_end':
        setDuelState(prev => ({ ...prev, status: 'finished' }));
        break;
    }
  }, [messages, player.id, connectedOpponent, setOpponent]);

  // Проверка готовности обеих сторон
  useEffect(() => {
    if (duelState.status === 'found' && 
        playerState.isReady && 
        connectedOpponent?.isReady) {
      setDuelState(prev => ({ ...prev, status: 'countdown' }));
      setCountdownTimer(3);
    }
  }, [duelState.status, playerState.isReady, connectedOpponent?.isReady]);

  // Отсчет до начала игры
  useEffect(() => {
    if (duelState.status === 'countdown' && countdownTimer > 0) {
      const timer = setTimeout(() => {
        setCountdownTimer(prev => prev - 1);
        hapticManager.light();
      }, 1000);

      return () => clearTimeout(timer);
    } else if (duelState.status === 'countdown' && countdownTimer === 0) {
      setDuelState(prev => ({ ...prev, status: 'playing' }));
      setGameTimer(duelState.timeLeft);
      hapticManager.heavy();
    }
  }, [duelState.status, countdownTimer, duelState.timeLeft]);

  // Игровой таймер
  useEffect(() => {
    if (duelState.status === 'playing' && gameTimer > 0) {
      const timer = setTimeout(() => {
        setGameTimer(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (duelState.status === 'playing' && gameTimer === 0) {
      // Время вышло - определяем победителя по очкам
      const winner = playerState.score > (connectedOpponent?.score || 0) ? playerState.id : 
                    (connectedOpponent?.score || 0) > playerState.score ? connectedOpponent?.id : null;
      
      setDuelState(prev => ({ 
        ...prev, 
        status: 'finished',
        winner 
      }));
    }
  }, [duelState.status, gameTimer, playerState.score, connectedOpponent?.score]);

  const handlePlayerReady = () => {
    setPlayerState(prev => ({ ...prev, isReady: true }));
    setReady();
    hapticManager.medium();
  };

  const handlePlayerClick = useCallback(() => {
    if (duelState.status !== 'playing') return;

    // Симуляция клика игрока
    const points = Math.floor(Math.random() * 80) + 20;
    const gotShocked = Math.random() < 0.25; // 25% шанс удара током

    if (gotShocked) {
      const damage = 30;
      setPlayerState(prev => ({
        ...prev,
        volts: Math.max(0, prev.volts - damage),
        streak: 0
      }));
      sendPlayerShocked(damage);
      hapticManager.heavy();
    } else {
      setPlayerState(prev => ({
        ...prev,
        score: prev.score + points,
        volts: prev.volts + points,
        streak: prev.streak + 1
      }));
      sendPlayerAction(points, points);
      hapticManager.light();
    }
  }, [duelState.status, sendPlayerAction, sendPlayerShocked]);

  const handleBackToMenu = () => {
    hapticManager.light();
    leaveDuel();
    endGame();
  };

  const getStatusText = () => {
    switch (duelState.status) {
      case 'connecting': return 'Подключение к серверу...';
      case 'searching': return 'Поиск соперника...';
      case 'found': return 'Соперник найден!';
      case 'ready': return 'Приготовьтесь!';
      case 'countdown': return `Начинаем через ${countdownTimer}`;
      case 'playing': return `Осталось: ${gameTimer}с`;
      case 'finished': 
        if (!duelState.winner) return 'Ничья!';
        return duelState.winner === playerState.id ? 'Победа!' : 'Поражение';
      default: return '';
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) return '🔴 Не подключен';
    if (!currentRoom) return '🟡 Подключен';
    return '🟢 В дуэли';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark to-background-darker">
      {/* Header */}
      <div className="bg-black/40 border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBackToMenu}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Назад
          </button>
          <h1 className="text-xl font-bold text-primary-orange">⚔️ ДУЭЛЬ REAL-TIME</h1>
          <div className="text-sm text-gray-400">
            {getConnectionStatus()}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-black/30 p-4 text-center">
        <motion.div
          className="text-2xl font-bold text-white"
          animate={{ scale: duelState.status === 'countdown' ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5, repeat: duelState.status === 'countdown' ? Infinity : 0 }}
        >
          {getStatusText()}
        </motion.div>
        {currentRoom && (
          <div className="text-sm text-gray-400 mt-2">
            Комната: {currentRoom.id.slice(-8)}
          </div>
        )}
      </div>

      {/* Players Comparison */}
      {(duelState.status === 'found' || duelState.status === 'ready' || 
        duelState.status === 'countdown' || duelState.status === 'playing' || 
        duelState.status === 'finished') && connectedOpponent && (
        <div className="flex justify-between items-center p-4 bg-black/20">
          {/* Player */}
          <motion.div 
            className="glass-effect p-4 rounded-xl flex-1 mr-2"
            animate={{ 
              borderColor: playerState.isReady ? '#10B981' : '#6B7280',
              boxShadow: playerState.streak > 0 ? '0 0 20px #10B981' : 'none'
            }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{playerState.name}</div>
              <div className="text-sm text-gray-300">Уровень {playerState.level}</div>
              <div className="text-2xl font-bold text-white mt-2">{playerState.score}</div>
              <div className="text-xs text-gray-400">Очки</div>
              <div className="text-sm text-yellow-400 mt-1">
                Серия: {playerState.streak}
              </div>
              <div className="text-sm text-blue-400">
                {playerState.volts}⚡
              </div>
              {playerState.isReady && (
                <div className="text-xs text-green-400 mt-1">✓ Готов</div>
              )}
            </div>
          </motion.div>

          {/* VS */}
          <div className="px-4">
            <div className="text-3xl font-bold text-red-400">VS</div>
          </div>

          {/* Opponent */}
          <motion.div 
            className="glass-effect p-4 rounded-xl flex-1 ml-2"
            animate={{ 
              borderColor: connectedOpponent.isReady ? '#10B981' : '#6B7280',
              boxShadow: connectedOpponent.streak > 0 ? '0 0 20px #EF4444' : 'none'
            }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{connectedOpponent.name}</div>
              <div className="text-sm text-gray-300">Уровень {connectedOpponent.level}</div>
              <div className="text-2xl font-bold text-white mt-2">{connectedOpponent.score}</div>
              <div className="text-xs text-gray-400">Очки</div>
              <div className="text-sm text-yellow-400 mt-1">
                Серия: {connectedOpponent.streak}
              </div>
              <div className="text-sm text-blue-400">
                {connectedOpponent.volts}⚡
              </div>
              {connectedOpponent.isReady && (
                <div className="text-xs text-green-400 mt-1">✓ Готов</div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {(duelState.status === 'connecting' || duelState.status === 'searching') && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">
                {duelState.status === 'connecting' ? '�' : '�🔍'}
              </div>
              <div className="text-xl text-gray-300 mb-4">
                {duelState.status === 'connecting' 
                  ? 'Подключение к серверу...' 
                  : 'Ищем достойного соперника...'}
              </div>
              <div className="animate-spin text-4xl">⚡</div>
            </motion.div>
          )}

          {duelState.status === 'found' && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">⚔️</div>
              <div className="text-xl text-white mb-6">Соперник найден!</div>
              <div className="text-lg text-gray-300 mb-4">
                {connectedOpponent?.name} (Уровень {connectedOpponent?.level})
              </div>
              <motion.button
                onClick={handlePlayerReady}
                disabled={playerState.isReady}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-colors ${
                  playerState.isReady 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
                whileHover={{ scale: playerState.isReady ? 1 : 1.05 }}
                whileTap={{ scale: playerState.isReady ? 1 : 0.95 }}
              >
                {playerState.isReady ? '✓ Готов! Ждем соперника...' : 'Готов к бою!'}
              </motion.button>
            </motion.div>
          )}

          {duelState.status === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="text-center"
            >
              <motion.div
                className="text-9xl font-bold text-red-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {countdownTimer || '⚡'}
              </motion.div>
            </motion.div>
          )}

          {duelState.status === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              <div 
                className="w-full h-48 bg-orange-500 rounded-lg cursor-pointer flex items-center justify-center hover:bg-orange-600 transition-colors"
                onClick={handlePlayerClick}
              >
                <span className="text-white text-2xl font-bold">⚡ КЛИК ⚡</span>
              </div>
              <div className="text-center mt-4 text-white">
                🔥 Real-time дуэль! Кликайте быстро! 🔥
              </div>
              <div className="text-center mt-2 text-gray-400 text-sm">
                Время: {gameTimer}с | Ваш счет: {playerState.score} | Соперник: {connectedOpponent?.score || 0}
              </div>
            </motion.div>
          )}

          {duelState.status === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">
                {duelState.winner === playerState.id ? '🏆' : 
                 duelState.winner === connectedOpponent?.id ? '💀' : '🤝'}
              </div>
              <div className="text-3xl font-bold text-white mb-4">
                {getStatusText()}
              </div>
              <div className="text-lg text-gray-300 mb-6">
                Финальный счет: {playerState.score} - {connectedOpponent?.score || 0}
              </div>
              {duelState.winner === playerState.id && (
                <div className="text-green-400 text-lg mb-4">
                  +{Math.floor(playerState.score * 0.1)} опыта за победу!
                </div>
              )}
              <motion.button
                onClick={handleBackToMenu}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Вернуться в меню
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
