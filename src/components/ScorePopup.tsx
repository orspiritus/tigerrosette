import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScorePopupProps {
  score: number;
  reason: string;
  isVisible: boolean;
  position: { x: number; y: number };
  type: 'success' | 'shock' | 'bonus';
  experience?: number;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({ 
  score, 
  reason, 
  isVisible, 
  position,
  type,
  experience = 0
}) => {
  const getColorClass = () => {
    switch (type) {
      case 'success':
        return score >= 30 ? 'text-yellow-300' : 
               score >= 20 ? 'text-green-300' : 'text-blue-300';
      case 'shock':
        return 'text-red-300';
      case 'bonus':
        return 'text-purple-300';
      default:
        return 'text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return score >= 30 ? '🔥' : score >= 20 ? '⚡' : '✨';
      case 'shock':
        return '💥';
      case 'bonus':
        return '🎉';
      default:
        return '⚡';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute pointer-events-none z-50 ${getColorClass()}`}
          initial={{
            opacity: 0,
            scale: 0.5,
            x: position.x,
            y: position.y
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
            y: position.y - 80,
            x: position.x + (Math.random() - 0.5) * 40
          }}
          transition={{
            duration: 2,
            ease: 'easeOut'
          }}
        >
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-current">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getIcon()}</span>
              <div>
                <div className="font-bold text-lg">+{score}⚡</div>
                {experience > 0 && (
                  <div className="text-xs text-blue-300">+{experience} опыта</div>
                )}
                <div className="text-xs opacity-80">{reason}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
