import React from 'react';
import { motion } from 'framer-motion';
import { useGameApi, useOfflineMode } from '../hooks/useGameApi';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isAuthenticated } = useGameApi();
  const { isOnline } = useOfflineMode();

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        text: 'Нет подключения',
        color: 'text-red-400',
        icon: '❌',
        bgColor: 'bg-red-500/10'
      };
    }

    if (!isAuthenticated) {
      return {
        text: 'Автономный режим',
        color: 'text-yellow-400',
        icon: '⚠️',
        bgColor: 'bg-yellow-500/10'
      };
    }

    return {
      text: 'Подключено к серверу',
      color: 'text-green-400',
      icon: '✅',
      bgColor: 'bg-green-500/10'
    };
  };

  const status = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-effect p-2 rounded-lg ${status.bgColor} ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm">{status.icon}</span>
        <span className={`text-xs font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>
    </motion.div>
  );
};
