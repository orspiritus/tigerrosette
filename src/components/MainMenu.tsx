import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { hapticManager } from '../utils/hapticManager';
import { ScoreBreakdown } from './ScoreBreakdown';
import { LevelDisplay } from './LevelDisplay';
import { HapticSettings } from './HapticSettings';
import { TelegramUserInfo } from './TelegramUserInfo';
import { useGameApi } from '../hooks/useGameApi';

export const MainMenu: React.FC = () => {
  const { 
    player, 
    startSingleMode, 
    startMultiplayerMode,
    addExperience,
    loadStatsFromServer 
  } = useGameStore();
  const { isAuthenticated } = useGameApi();
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showHapticSettings, setShowHapticSettings] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Загружаем статистику с сервера при первом запуске
  useEffect(() => {
    const loadServerStats = async () => {
      if (isAuthenticated && !isLoadingStats) {
        setIsLoadingStats(true);
        
        try {
          const result = await loadStatsFromServer();
          
          if (result.success) {
            console.log('✅ Статистика загружена с сервера');
          } else {
            console.warn('⚠️ Не удалось загрузить статистику с сервера:', result.error);
          }
        } catch (error) {
          console.error('❌ Ошибка при загрузке статистики:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    loadServerStats();
  }, [isAuthenticated, loadStatsFromServer, isLoadingStats]);
  
  // Development helper to test level system
  const handleQuickLevelUp = () => {
    addExperience(100); // Add 100 experience for testing
  };

  const handleStartGame = (difficulty: 'easy' | 'medium' | 'hard' | 'extreme') => {
    hapticManager.medium(); // Вибрация при начале игры
    startSingleMode(difficulty);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background-dark to-background-darker">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl font-bold text-primary-orange tiger-stripes bg-clip-text text-transparent mb-4">
          ТИГР
        </h1>
        <h2 className="text-4xl font-bold text-accent-blue mb-2">
          РОЗЕТКА
        </h2>
        <p className="text-lg text-gray-300">
          Telegram Mini App Game
        </p>
      </motion.div>

      {/* Level Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6"
      >
        <LevelDisplay />
      </motion.div>

      {/* Статус синхронизации */}
      {isAuthenticated && isLoadingStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-center text-blue-400 text-sm"
        >
          <span className="inline-block animate-spin mr-2">⏳</span>
          Синхронизация с сервером...
        </motion.div>
      )}

      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-center text-yellow-400 text-sm"
        >
          ⚠️ Игра в автономном режиме
        </motion.div>
      )}

      {/* Telegram User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mb-4 w-full max-w-md"
      >
        <TelegramUserInfo />
      </motion.div>

      {/* Player Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-effect p-6 mb-8 text-center"
      >
        <div className="text-sm text-gray-300 mb-2">Добро пожаловать, {player.name}!</div>
        <div className="flex justify-center space-x-6">
          <div>
            <div className="text-xs text-gray-400">ВОЛЬТЫ</div>
            <div className="text-xl font-bold text-primary-orange">{player.volts}⚡</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">УРОВЕНЬ</div>
            <div className="text-xl font-bold text-accent-blue">{player.level}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">ВСЕГО НАЖАТИЙ</div>
            <div className="text-xl font-bold text-accent-lime">{player.totalClicks}</div>
          </div>
        </div>
      </motion.div>

      {/* Game Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full max-w-md space-y-4"
      >
        <h3 className="text-2xl font-bold text-center text-white mb-6">
          ⚡ Одиночный режим
        </h3>
        <p className="text-center text-gray-300 text-sm mb-4">
          Выберите сложность игры против ИИ электрика
        </p>

        {/* Easy Mode */}
        <motion.button
          onClick={() => handleStartGame('easy')}
          className="w-full glass-effect p-4 rounded-xl hover:bg-green-500/20 transition-colors"
          whileHover={{ scale: 1.02, x: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-center">
            <div className="text-left">
              <div className="text-lg font-bold text-green-400">ЛЁГКИЙ</div>
              <div className="text-sm text-gray-300">15% шанс разряда • 2 сек предупреждение</div>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
        </motion.button>

        {/* Medium Mode */}
        <motion.button
          onClick={() => handleStartGame('medium')}
          className="w-full glass-effect p-4 rounded-xl hover:bg-yellow-500/20 transition-colors"
          whileHover={{ scale: 1.02, x: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-center">
            <div className="text-left">
              <div className="text-lg font-bold text-yellow-400">СРЕДНИЙ</div>
              <div className="text-sm text-gray-300">25% шанс разряда • 1.5 сек предупреждение</div>
            </div>
            <div className="text-2xl">🟡</div>
          </div>
        </motion.button>

        {/* Hard Mode */}
        <motion.button
          onClick={() => handleStartGame('hard')}
          className="w-full glass-effect p-4 rounded-xl hover:bg-orange-500/20 transition-colors"
          whileHover={{ scale: 1.02, x: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-center">
            <div className="text-left">
              <div className="text-lg font-bold text-orange-400">СЛОЖНЫЙ</div>
              <div className="text-sm text-gray-300">35% шанс разряда • 1 сек предупреждение</div>
            </div>
            <div className="text-2xl">🟠</div>
          </div>
        </motion.button>

        {/* Extreme Mode */}
        <motion.button
          onClick={() => handleStartGame('extreme')}
          className="w-full glass-effect p-4 rounded-xl hover:bg-red-500/20 transition-colors"
          whileHover={{ scale: 1.02, x: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-center">
            <div className="text-left">
              <div className="text-lg font-bold text-red-400">ЭКСТРИМ</div>
              <div className="text-sm text-gray-300">50% шанс разряда • 0.5 сек предупреждение</div>
            </div>
            <div className="text-2xl">🔴</div>
          </div>
        </motion.button>

        {/* Multiplayer Mode Section */}
        <motion.div
          className="w-full border-t border-white/10 pt-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h4 className="text-xl font-bold text-center text-white mb-4">
            🎮 Многопользовательский режим
          </h4>
          
          {/* Coming Soon for now */}
          <motion.button
            onClick={() => {
              hapticManager.medium();
              startMultiplayerMode('duel');
            }}
            className="w-full glass-effect p-4 rounded-xl hover:bg-purple-500/20 transition-colors border border-purple-400/30"
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="text-lg font-bold text-purple-400">ДУЭЛЬ</div>
                <div className="text-sm text-gray-300">Соревнование 1v1 • Real-time бой</div>
              </div>
              <div className="text-2xl">⚔️</div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => {
              hapticManager.medium();
              startMultiplayerMode('tournament');
            }}
            className="w-full glass-effect p-4 rounded-xl hover:bg-blue-500/20 transition-colors border border-blue-400/30 mt-3"
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="text-lg font-bold text-blue-400">ТУРНИР</div>
                <div className="text-sm text-gray-300">До 8 игроков • Браккет система</div>
              </div>
              <div className="text-2xl">🏆</div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => {
              hapticManager.medium();
              startMultiplayerMode('coop');
            }}
            className="w-full glass-effect p-4 rounded-xl hover:bg-green-500/20 transition-colors border border-green-400/30 mt-3"
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="text-lg font-bold text-green-400">КООП</div>
                <div className="text-sm text-gray-300">Командная игра • Против ИИ</div>
              </div>
              <div className="text-2xl">🤝</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Score Breakdown Button */}
        <motion.button
          onClick={() => {
            hapticManager.light();
            setShowScoreBreakdown(true);
          }}
          className="w-full glass-effect p-3 rounded-xl hover:bg-blue-500/20 transition-colors border border-blue-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-center items-center space-x-2">
            <span className="text-lg">📊</span>
            <span className="text-lg font-semibold text-blue-400">Очки и уровни</span>
          </div>
        </motion.button>

        {/* Haptic Settings Button */}
        <motion.button
          onClick={() => {
            hapticManager.light();
            setShowHapticSettings(true);
          }}
          className="w-full glass-effect p-3 rounded-xl hover:bg-purple-500/20 transition-colors border border-purple-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-center items-center space-x-2">
            <span className="text-lg">📳</span>
            <span className="text-lg font-semibold text-purple-400">Вибрация</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Score Breakdown Modal */}
      {showScoreBreakdown && (
        <ScoreBreakdown onClose={() => setShowScoreBreakdown(false)} />
      )}

      {/* Haptic Settings Modal */}
      {showHapticSettings && (
        <HapticSettings 
          isVisible={showHapticSettings}
          onClose={() => setShowHapticSettings(false)} 
        />
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-8 text-center text-gray-400 text-sm space-y-2"
      >
        <p>⚡ Играй осторожно! ⚡</p>
        <p className="mt-2">v1.1.0 | Single Mode + Multiplayer Preview</p>
        
        {/* Development button for testing levels */}
        <button 
          onClick={() => {
            hapticManager.light();
            handleQuickLevelUp();
          }}
          className="mt-2 px-3 py-1 text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded transition-colors"
        >
          🔧 +100 опыта (тест)
        </button>
      </motion.div>
    </div>
  );
};
