import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { hapticManager } from '../utils/hapticManager';

export const MultiplayerScreen: React.FC = () => {
  const handleBackToMenu = () => {
    hapticManager.light();
    useGameStore.getState().endGame();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background-dark to-background-darker">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-primary-orange mb-4">
          🎮 Многопользовательский режим
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Скоро здесь будут эпические дуэли!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-effect p-8 rounded-xl text-center max-w-md"
      >
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-white mb-4">В разработке</h2>
        <p className="text-gray-300 mb-6">
          Мы работаем над захватывающими многопользовательскими режимами:
        </p>
        
        <div className="space-y-3 text-left mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-purple-400">⚔️</span>
            <span className="text-gray-300">Дуэли 1v1 в реальном времени</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-blue-400">🏆</span>
            <span className="text-gray-300">Турниры до 8 игроков</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-green-400">🤝</span>
            <span className="text-gray-300">Кооперативные режимы</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-yellow-400">📊</span>
            <span className="text-gray-300">Глобальные таблицы лидеров</span>
          </div>
        </div>

        <motion.button
          onClick={handleBackToMenu}
          className="w-full glass-effect p-3 rounded-xl hover:bg-orange-500/20 transition-colors border border-orange-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-lg font-semibold text-orange-400">
            ← Назад в меню
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 text-center text-gray-400 text-sm"
      >
        <p>🔔 Подпишитесь на уведомления, чтобы узнать о запуске первыми!</p>
      </motion.div>
    </div>
  );
};
