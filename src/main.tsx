import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Инициализация Telegram Mini App
// Расширяем WebApp до полного экрана
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Основная настройка
  tg.ready();
  tg.expand();
  
  // Настройка цветовой темы
  tg.setHeaderColor('#000000');
  tg.setBackgroundColor('#000000');
  
  // Отключаем кнопку "Назад" (будем управлять навигацией сами)
  tg.BackButton.hide();
  
  // Включаем тактильные уведомления если доступны
  if (tg.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }
  
  console.log('Telegram WebApp initialized:', {
    version: tg.version,
    platform: tg.platform,
    colorScheme: tg.colorScheme,
    user: tg.initDataUnsafe?.user
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
