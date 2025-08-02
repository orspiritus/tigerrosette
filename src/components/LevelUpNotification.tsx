import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelConfig } from '../utils/levelSystem';

interface LevelUpNotificationProps {
  isVisible: boolean;
  newLevel: LevelConfig;
  voltsReward: number;
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isVisible,
  newLevel,
  voltsReward,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.6 
            }}
            className="glass-effect p-8 max-w-md mx-4 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Level up content */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
            >
              <div className="text-6xl mb-4">🎉</div>
              
              <motion.h2 
                className="text-3xl font-bold text-primary-orange mb-2"
                animate={{ 
                  textShadow: [
                    "0 0 10px rgba(255, 107, 53, 0.5)",
                    "0 0 20px rgba(255, 107, 53, 0.8)",
                    "0 0 10px rgba(255, 107, 53, 0.5)"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                НОВЫЙ УРОВЕНЬ!
              </motion.h2>
              
              <div className="mb-4">
                <div className="text-5xl font-bold text-accent-blue mb-2">
                  {newLevel.level}
                </div>
                <div className="text-xl text-yellow-300 font-semibold mb-1">
                  {newLevel.title}
                </div>
                <div className="text-sm text-gray-300 italic">
                  {newLevel.description}
                </div>
              </div>

              <motion.div 
                className="glass-effect p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(255, 193, 7, 0.3)",
                    "0 0 30px rgba(255, 193, 7, 0.6)",
                    "0 0 20px rgba(255, 193, 7, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-lg font-bold text-yellow-300 mb-1">
                  Награда за уровень:
                </div>
                <div className="text-2xl font-bold text-white">
                  +{voltsReward}⚡ Вольт
                </div>
              </motion.div>
            </motion.div>

            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="mt-6 px-6 py-3 bg-primary-orange hover:bg-primary-orange/80 text-white font-bold rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Продолжить
            </motion.button>

            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B35', '#00D4FF', '#E8FF00', '#8A2BE2'][i % 5],
                    left: `${50 + (Math.random() - 0.5) * 60}%`,
                    top: '20%',
                  }}
                  animate={{
                    y: ['0vh', '80vh'],
                    x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
