import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameScreen } from './components/GameScreen';
import { LevelUpNotification } from './components/LevelUpNotification';

// Initialize Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
        };
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
      };
    };
  }
}

function App() {
  const { gameState, levelUpNotification, hideLevelUpNotification } = useGameStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <div className="App">
      {gameState.mode === 'menu' && <MainMenu />}
      {gameState.mode === 'single' && <GameScreen />}
      
      {/* Level Up Notification - Global */}
      <LevelUpNotification
        isVisible={levelUpNotification.isVisible}
        newLevel={levelUpNotification.level}
        voltsReward={levelUpNotification.voltsReward || 0}
        onClose={hideLevelUpNotification}
      />
    </div>
  );
}

export default App;
