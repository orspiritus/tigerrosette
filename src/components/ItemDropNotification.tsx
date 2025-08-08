import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

interface DropNotification {
  id: string;
  message: string;
  timestamp: number;
}

export const ItemDropNotification: React.FC = () => {
  const { aiElectrician } = useGameStore();
  const [notifications, setNotifications] = useState<DropNotification[]>([]);

  useEffect(() => {
    // Проверяем новые сообщения от ИИ электрика
    if (aiElectrician.lastMessage && aiElectrician.messageTime) {
      const isItemDrop = aiElectrician.lastMessage.includes('🧤') || 
                        aiElectrician.lastMessage.includes('👢') || 
                        aiElectrician.lastMessage.includes('⛑️') || 
                        aiElectrician.lastMessage.includes('🥽') ||
                        aiElectrician.lastMessage.includes('💰');

      if (isItemDrop) {
        const newNotification: DropNotification = {
          id: `${aiElectrician.messageTime}-${Math.random()}`,
          message: aiElectrician.lastMessage,
          timestamp: aiElectrician.messageTime
        };

        setNotifications(prev => [...prev, newNotification]);

        // Удаляем уведомление через 5 секунд
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
      }
    }
  }, [aiElectrician.lastMessage, aiElectrician.messageTime]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              duration: 0.5 
            }}
            className="glass-effect bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-lg p-4 max-w-xs"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2,
                  ease: "easeInOut"
                }}
                className="text-2xl"
              >
                🎁
              </motion.div>
              <div>
                <div className="text-xs text-yellow-300 font-semibold mb-1">
                  НАХОДКА!
                </div>
                <div className="text-sm text-white font-medium">
                  {notification.message}
                </div>
              </div>
            </div>
            
            {/* Прогресс бар исчезновения */}
            <motion.div
              className="h-1 bg-yellow-500/30 rounded-full mt-3 overflow-hidden"
              initial={{ width: "100%" }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
