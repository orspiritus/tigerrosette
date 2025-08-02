import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { hapticManager } from '../utils/hapticManager';

interface HapticSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

export const HapticSettings: React.FC<HapticSettingsProps> = ({
  isVisible,
  onClose
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [testingType, setTestingType] = useState<string | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedEnabled = localStorage.getItem('hapticEnabled');
    if (savedEnabled !== null) {
      const enabled = JSON.parse(savedEnabled);
      setIsEnabled(enabled);
      hapticManager.setEnabled(enabled);
    }
  }, []);

  const handleToggleEnabled = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    hapticManager.setEnabled(newValue);
    localStorage.setItem('hapticEnabled', JSON.stringify(newValue));
    
    // Test vibration when enabling
    if (newValue) {
      hapticManager.test();
    }
  };

  const testHaptic = (type: string, action: () => void) => {
    setTestingType(type);
    action();
    setTimeout(() => setTestingType(null), 500);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-primary-orange/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-orange">Вибрация</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6">
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
            <div>
              <h3 className="text-lg font-semibold text-white">Включить вибрацию</h3>
              <p className="text-sm text-gray-400">
                {hapticManager.isAvailable() 
                  ? 'Поддерживается вашим устройством' 
                  : 'Недоступно на вашем устройстве'
                }
              </p>
            </div>
            <motion.button
              onClick={handleToggleEnabled}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                isEnabled ? 'bg-primary-orange' : 'bg-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full"
                animate={{ x: isEnabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>

        {/* Test Vibrations */}
        {isEnabled && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Тест вибрации</h3>
            
            {/* Game Events */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Игровые события</h4>
              
              <motion.button
                onClick={() => testHaptic('press', () => hapticManager.outletPress())}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  testingType === 'press' 
                    ? 'bg-blue-500/30 border-blue-400 text-blue-200' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔌 Нажатие на розетку
              </motion.button>

              <motion.button
                onClick={() => testHaptic('success', () => hapticManager.survivalSuccess())}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  testingType === 'success' 
                    ? 'bg-green-500/30 border-green-400 text-green-200' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✅ Успешное выживание
              </motion.button>

              <motion.button
                onClick={() => testHaptic('shock', () => hapticManager.electricShock())}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  testingType === 'shock' 
                    ? 'bg-red-500/30 border-red-400 text-red-200' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⚡ Удар током
              </motion.button>

              <motion.button
                onClick={() => testHaptic('levelup', () => hapticManager.levelUp())}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  testingType === 'levelup' 
                    ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🆙 Повышение уровня
              </motion.button>
            </div>

            {/* Intensity Levels */}
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium text-gray-300">Интенсивность</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  onClick={() => testHaptic('light', () => hapticManager.light())}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    testingType === 'light' 
                      ? 'bg-gray-500/30 border-gray-400 text-gray-200' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Легкая
                </motion.button>

                <motion.button
                  onClick={() => testHaptic('medium', () => hapticManager.medium())}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    testingType === 'medium' 
                      ? 'bg-gray-500/30 border-gray-400 text-gray-200' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Средняя
                </motion.button>

                <motion.button
                  onClick={() => testHaptic('heavy', () => hapticManager.heavy())}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    testingType === 'heavy' 
                      ? 'bg-gray-500/30 border-gray-400 text-gray-200' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Сильная
                </motion.button>

                <motion.button
                  onClick={() => testHaptic('rigid', () => hapticManager.rigid())}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    testingType === 'rigid' 
                      ? 'bg-gray-500/30 border-gray-400 text-gray-200' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Резкая
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            💡 Вибрация доступна только в Telegram Mini App на поддерживаемых устройствах
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
