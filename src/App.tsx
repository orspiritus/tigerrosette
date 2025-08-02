import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameScreen } from './components/GameScreen';
import { LevelUpNotification } from './components/LevelUpNotification';

function App() {
  const { gameState, levelUpNotification, hideLevelUpNotification } = useGameStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  console.log('App rendering, mode:', gameState.mode);

  return (
    <div className="App">
      {gameState.mode === 'menu' && <MainMenu />}
      {gameState.mode === 'single' && <GameScreen />}
      
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
  );
}

export default App;
