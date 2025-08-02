/**
 * TelegramUserInfo - компонент для отображения информации о пользователе Telegram
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from './TelegramProvider';

export const TelegramUserInfo: React.FC = () => {
  const { user, isInTelegram, platform, colorScheme } = useTelegram();

  if (!isInTelegram) {
    return (
      <div className="text-xs text-gray-500 text-center p-2">
        💻 Веб-версия (не в Telegram)
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-3 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user?.photo_url ? (
            <img 
              src={user.photo_url} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-blue-400/50"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.first_name?.[0] || '?'}
              </span>
            </div>
          )}
          
          <div>
            <div className="text-sm font-medium text-white">
              {user?.first_name} {user?.last_name}
              {user?.is_premium && <span className="ml-1 text-yellow-400">⭐</span>}
            </div>
            <div className="text-xs text-gray-400">
              @{user?.username || 'no_username'} • {platform}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded-full border ${
            colorScheme === 'dark' 
              ? 'bg-gray-800 border-gray-600 text-gray-300' 
              : 'bg-gray-200 border-gray-400 text-gray-700'
          }`}>
            {colorScheme === 'dark' ? '🌙' : '☀️'} {colorScheme}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
