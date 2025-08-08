import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { TigerOutlet } from './TigerOutlet';
import { GameHUD } from './GameHUD';
import { VideoTestButton } from './VideoTestButton';
import { useGameApi } from '../hooks/useGameApi';
import { ScreenShake } from './ScreenShake';

export const GameScreen: React.FC = () => {
  const { 
    gameState, 
    singleMode, 
    endGame, 
    player,
    submitGameToServer
  } = useGameStore();
  
  const { isAuthenticated } = useGameApi();
  const [gameTime, setGameTime] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Handle screen shake from electric shock
  const handleShockEffect = useCallback(() => {
    setIsScreenShaking(true);
    setTimeout(() => {
      setIsScreenShaking(false);
    }, 600); // Match ScreenShake duration
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  // Handle game over conditions
  useEffect(() => {
    // Game over after 10 minutes or specific achievements
    if (gameTime >= 600) { // 10 minutes
      setShowGameOver(true);
    }
  }, [gameTime]);

  const handleEndGame = async () => {
    setShowGameOver(false);
    setGameTime(0);
    
    // Сохраняем результаты на сервер, если пользователь аутентифицирован
    if (isAuthenticated && gameState.score > 0) {
      setIsSavingToServer(true);
      
      try {
        // Обновляем время игры в store перед отправкой
        const gameStore = useGameStore.getState();
        gameStore.gameState.gameTime = gameTime * 1000; // конвертируем в миллисекунды
        
        const result = await submitGameToServer();
        
        if (result.success) {
          console.log('✅ Игра успешно сохранена на сервер');
        } else {
          console.warn('⚠️ Не удалось сохранить игру на сервер:', result.error);
        }
      } catch (error) {
        console.error('❌ Ошибка при сохранении игры:', error);
      } finally {
        setIsSavingToServer(false);
      }
    }
    
    endGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showGameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-dark to-background-darker">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect p-8 text-center max-w-md"
        >
          <h2 className="text-3xl font-bold text-primary-orange mb-4">
            Игра окончена!
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Время игры:</span>
              <span className="font-bold">{formatTime(gameTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Финальный счёт:</span>
              <span className="font-bold text-accent-lime">{gameState.score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Получено вольт:</span>
              <span className="font-bold text-primary-orange">{gameState.score}⚡</span>
            </div>
            <div className="flex justify-between">
              <span>Всего нажатий:</span>
              <span className="font-bold text-accent-blue">{player.totalClicks}</span>
            </div>
            <div className="flex justify-between">
              <span>Лучшая серия:</span>
              <span className="font-bold text-yellow-400">{player.streak}</span>
            </div>
          </div>

          {/* Показываем статус сохранения */}
          {isAuthenticated && gameState.score > 0 && (
            <div className="mb-4 text-center">
              {isSavingToServer ? (
                <div className="text-blue-400 text-sm">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Сохранение результатов...
                </div>
              ) : (
                <div className="text-green-400 text-sm">
                  ✅ Результаты будут сохранены на сервер
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && gameState.score > 0 && (
            <div className="mb-4 text-center text-yellow-400 text-sm">
              ⚠️ Результаты сохраняются только локально
            </div>
          )}

          <motion.button
            onClick={handleEndGame}
            disabled={isSavingToServer}
            className="w-full glass-effect p-3 rounded-xl hover:bg-primary-orange/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isSavingToServer ? 1 : 1.05 }}
            whileTap={{ scale: isSavingToServer ? 1 : 0.95 }}
          >
            <span className="font-bold">
              {isSavingToServer ? 'Сохранение...' : 'Вернуться в меню'}
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ScreenShake isActive={isScreenShaking} />
      <VideoTestButton />
      <div className="min-h-screen bg-gradient-to-br from-background-dark to-background-darker relative">
      {/* Game HUD */}
      <GameHUD />
      
      {/* Main Game Area */}
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-8">
        {/* Game Timer */}
        <motion.div
          className="glass-effect px-6 py-3 mb-8"
          animate={{ 
            scale: gameTime % 10 === 0 && gameTime > 0 ? [1, 1.1, 1] : 1 
          }}
        >
          <div className="text-center">
            <div className="text-xs text-gray-300">ВРЕМЯ ИГРЫ</div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatTime(gameTime)}
            </div>
          </div>
        </motion.div>

        {/* Tiger Outlet - Main Game Element */}
        <TigerOutlet className="mb-8" onShock={handleShockEffect} />

        {/* Quick Stats */}
        <div className="flex space-x-4 text-center">
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">ПОСЛЕДНИЙ РИСК</div>
            <div className={`text-sm font-bold ${
              singleMode.currentRisk === 'extreme' ? 'text-red-400' :
              singleMode.currentRisk === 'high' ? 'text-orange-400' :
              singleMode.currentRisk === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {singleMode.currentRisk === 'extreme' ? 'ЭКСТРИМ' :
               singleMode.currentRisk === 'high' ? 'ВЫСОКИЙ' :
               singleMode.currentRisk === 'medium' ? 'СРЕДНИЙ' : 'НИЗКИЙ'}
            </div>
          </motion.div>
        </div>

        {/* Pause/Exit Button */}
        <motion.button
          onClick={handleEndGame}
          className="mt-8 glass-effect px-6 py-3 rounded-xl hover:bg-red-500/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-red-300 font-bold">Завершить игру</span>
        </motion.button>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Electric grid animation */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 107, 53, 0.05) 75%, rgba(255, 107, 53, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(255, 107, 53, 0.05) 25%, rgba(255, 107, 53, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 107, 53, 0.05) 75%, rgba(255, 107, 53, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
    </>
  );
};
