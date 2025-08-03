import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ConnectionStatus } from './ConnectionStatus';

export const GameHUD: React.FC = () => {
  const { player, gameState, singleMode } = useGameStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex justify-between items-center p-4">
        {/* Score Display */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">СЧЁТ</div>
            <div className="text-xl font-bold text-accent-lime">
              {gameState.score.toLocaleString()}
            </div>
          </motion.div>
          
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">ВОЛЬТЫ</div>
            <div className="text-xl font-bold text-primary-orange">
              {player.volts.toLocaleString()}⚡
            </div>
          </motion.div>
        </div>

        {/* Streak Counter */}
        <div className="text-center">
          <motion.div 
            className="glass-effect px-4 py-2"
            animate={{ 
              scale: singleMode.streakCount > 0 ? [1, 1.1, 1] : 1,
              boxShadow: singleMode.streakCount >= 5 
                ? '0 0 20px #E8FF00' 
                : '0 0 10px rgba(255,255,255,0.2)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs text-gray-300">СЕРИЯ</div>
            <div className={`text-xl font-bold ${
              singleMode.streakCount >= 25 ? 'text-red-400' :
              singleMode.streakCount >= 10 ? 'text-orange-400' :
              singleMode.streakCount >= 5 ? 'text-yellow-400' :
              'text-white'
            }`}>
              {singleMode.streakCount}
            </div>
          </motion.div>
        </div>

        {/* Difficulty & Stats */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">СЛОЖНОСТЬ</div>
            <div className={`text-sm font-bold ${
              singleMode.difficulty === 'extreme' ? 'text-red-400' :
              singleMode.difficulty === 'hard' ? 'text-orange-400' :
              singleMode.difficulty === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {singleMode.difficulty === 'extreme' ? 'ЭКСТРИМ' :
               singleMode.difficulty === 'hard' ? 'СЛОЖНЫЙ' :
               singleMode.difficulty === 'medium' ? 'СРЕДНИЙ' : 'ЛЁГКИЙ'}
            </div>
          </motion.div>

          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">НАЖАТИЙ</div>
            <div className="text-lg font-bold text-accent-blue">
              {player.totalClicks}
            </div>
          </motion.div>

          {/* Connection Status */}
          <ConnectionStatus />
        </div>
      </div>
      
      {/* Warning Banner */}
      {singleMode.warningActive && (
        <motion.div
          className="bg-yellow-500/80 text-black px-4 py-2 text-center font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: [0, 1, 0.7, 1, 0.7, 1], 
            y: 0 
          }}
          transition={{ duration: 0.5 }}
        >
          ⚠️ ВНИМАНИЕ! ГОТОВИТСЯ РАЗРЯД! ⚠️
        </motion.div>
      )}
    </div>
  );
};
