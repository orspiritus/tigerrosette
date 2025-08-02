import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getLevelProgress, getOutletImageByLevel } from '../utils/levelSystem';

export const LevelDisplay: React.FC = () => {
  const { player, getCurrentLevelInfo } = useGameStore();
  const { currentLevel, progressInfo } = getCurrentLevelInfo();
  const progressPercent = getLevelProgress(player.experience);
  
  // Check if outlet image will change at next level
  const currentOutletImage = getOutletImageByLevel(currentLevel.level);
  const nextOutletImage = progressInfo.nextLevel ? getOutletImageByLevel(progressInfo.nextLevel.level) : null;
  const outletWillChange = nextOutletImage && nextOutletImage !== currentOutletImage;

  return (
    <div className="glass-effect p-4 rounded-xl space-y-3">
      {/* Level Title and Number */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Current Outlet Image */}
          <img 
            src={getOutletImageByLevel(currentLevel.level)} 
            alt={`Розетка уровня ${currentLevel.level}`}
            className="w-12 h-12 rounded-lg border-2 border-primary-orange shadow-lg"
          />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Уровень</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-primary-orange">{currentLevel.level}</span>
              <span className="text-sm text-gray-300">{currentLevel.title}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Опыт</div>
          <div className="text-lg font-bold text-accent-blue">
            {player.experience.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{progressInfo.current}</span>
          <span>{progressInfo.nextLevel ? `${progressInfo.remaining} до ${progressInfo.nextLevel.level} уровня` : 'Максимум'}</span>
          <span>{progressInfo.required}</span>
        </div>
        
        <div className="relative w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-blue to-primary-orange rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          
          {/* Spark effect on progress bar */}
          {progressPercent > 0 && (
            <motion.div
              className="absolute top-0 right-0 w-1 h-full bg-white opacity-80"
              style={{ right: `${100 - progressPercent}%` }}
              animate={{ opacity: [0.8, 0.3, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </div>
      </div>

      {/* Level Description */}
      <div className="text-xs text-gray-400 italic text-center">
        {currentLevel.description}
      </div>

      {/* Next Level Preview */}
      {progressInfo.nextLevel && (
        <div className="text-center pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-500">Следующий уровень</div>
          <div className="text-sm">
            <span className="text-accent-lime font-semibold">{progressInfo.nextLevel.title}</span>
            <span className="text-gray-400"> • </span>
            <span className="text-yellow-400">+{progressInfo.nextLevel.voltsReward}⚡</span>
          </div>
          
          {/* Show next outlet image if it will change */}
          {outletWillChange && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="text-xs text-blue-300">🎨 Новая розетка:</span>
              <img 
                src={nextOutletImage} 
                alt={`Розетка уровня ${progressInfo.nextLevel.level}`}
                className="w-6 h-6 rounded border border-blue-400 shadow-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
