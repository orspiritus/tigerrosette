/**
 * TelegramProvider - компонент для управления интеграцией с Telegram Mini App
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { TelegramWebApp, TelegramUser } from '../types/telegram';

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isInTelegram: boolean;
  platform: string;
  colorScheme: 'light' | 'dark';
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isInTelegram: false,
  platform: 'unknown',
  colorScheme: 'dark'
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: React.ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp as TelegramWebApp;
      
      setWebApp(tgWebApp);
      setIsInTelegram(true);
      setPlatform(tgWebApp.platform || 'unknown');
      setColorScheme(tgWebApp.colorScheme || 'dark');
      
      // Получение информации о пользователе
      if (tgWebApp.initDataUnsafe?.user) {
        setUser(tgWebApp.initDataUnsafe.user);
      }

      // Инициализация
      tgWebApp.ready();
      tgWebApp.expand();

      console.log('Telegram WebApp Context initialized:', {
        platform: tgWebApp.platform,
        colorScheme: tgWebApp.colorScheme,
        user: tgWebApp.initDataUnsafe?.user,
        version: tgWebApp.version
      });
    }
  }, []);

  const contextValue: TelegramContextType = {
    webApp,
    user,
    isInTelegram,
    platform,
    colorScheme
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramProvider;
