import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameScreen } from './components/GameScreen';
import { MultiplayerScreen } from './components/MultiplayerScreen';
import { DuelScreen } from './components/DuelScreen';
import { LevelUpNotification } from './components/LevelUpNotification';
import { TelegramProvider } from './components/TelegramProvider';

function App() {
  const { gameState, levelUpNotification, hideLevelUpNotification } = useGameStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Основная инициализация
      webApp.ready();
      webApp.expand();
      
      // Настройка темы приложения
      webApp.setHeaderColor('#FF6B35'); // Оранжевый цвет TigerRozetka
      webApp.setBackgroundColor('#1A1A1A'); // Темный фон
      
      // Включение подтверждения закрытия
      webApp.enableClosingConfirmation();
      
      // Настройка главной кнопки (опционально)
      if (webApp.MainButton) {
        webApp.MainButton.setText('🎮 Играть');
        webApp.MainButton.color = '#FF6B35';
        webApp.MainButton.textColor = '#FFFFFF';
      }
      
      // Логирование для отладки
      console.log('Telegram WebApp initialized:', {
        platform: webApp.platform,
        version: webApp.version,
        colorScheme: webApp.colorScheme,
        user: webApp.initDataUnsafe?.user
      });
    } else {
      console.log('Running outside Telegram environment');
    }
  }, []);

  console.log('App rendering, mode:', gameState.mode);

  return (
    <TelegramProvider>
      <div className="App">
        {gameState.mode === 'menu' && <MainMenu />}
        {gameState.mode === 'single' && <GameScreen />}
        {gameState.mode === 'multiplayer' && <MultiplayerScreen />}
        {gameState.mode === 'duel' && <DuelScreen />}
        
        {/* Level Up Notification - Global */}
        {levelUpNotification.level && (
          <LevelUpNotification
            isVisible={levelUpNotification.isVisible}
            newLevel={levelUpNotification.level}
            voltsReward={levelUpNotification.voltsReward || 0}
            onClose={hideLevelUpNotification}
          />
        )}
      </div>
    </TelegramProvider>
  );
}

export default App;
