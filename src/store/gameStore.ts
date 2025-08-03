import { create } from 'zustand';
import { GameStore, GameState, Player, SingleModeState, Achievement, ScoreData, SoundConfig, ShockImpact } from '../types/game';
import { calculateLevel, getExperienceToNextLevel, EXPERIENCE_REWARDS } from '../utils/levelSystem';
import { apiClient } from '../utils/apiClient';

// Default states
const defaultGameState: GameState = {
  mode: 'menu',
  isPlaying: false,
  isPaused: false,
  gameTime: 0,
  score: 0
};

const defaultPlayer: Player = {
  id: 'player1',
  name: 'Смельчак',
  volts: 0,
  level: 1,
  experience: 0,
  streak: 0,
  totalClicks: 0,
  successfulClicks: 0,
  shockedClicks: 0,
  luckCoefficient: 50, // Начинаем с 50%
  luckIndicatorHidden: false,
  luckHiddenUntil: 0,
  survivalTime: 0
};

const defaultSingleMode: SingleModeState = {
  difficulty: 'easy',
  aiPattern: 'regular',
  currentRisk: 'low',
  streakCount: 0,
  timeInSafeZone: 0,
  lastClickTime: 0,
  dangerLevel: 0,
  warningSignsActive: false
};

const defaultSounds: SoundConfig = {
  volume: 0.7,
  enabled: true,
  backgroundMusicEnabled: true
};

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first_click',
    name: 'Первое прикосновение',
    description: 'Нажми на розетку впервые',
    icon: '⚡',
    requirement: 1,
    progress: 0,
    completed: false,
    reward: 50,
    category: 'special'
  },
  {
    id: 'survivor_5',
    name: 'Живчик',
    description: 'Серия из 5 успешных нажатий',
    icon: '🏃',
    requirement: 5,
    progress: 0,
    completed: false,
    reward: 100,
    category: 'streak'
  },
  {
    id: 'survivor_25',
    name: 'Неубиваемый',
    description: 'Серия из 25 успешных нажатий',
    icon: '�',
    requirement: 25,
    progress: 0,
    completed: false,
    reward: 500,
    category: 'streak'
  },
  {
    id: 'risk_taker',
    name: 'Безрассудный',
    description: '50 нажатий в режиме High Risk',
    icon: '🔥',
    requirement: 50,
    progress: 0,
    completed: false,
    reward: 500,
    category: 'risk'
  },
  {
    id: 'time_survivor',
    name: 'Выживальщик',
    description: 'Выживи 5 минут без поражения',
    icon: '⏰',
    requirement: 300,
    progress: 0,
    completed: false,
    reward: 1000,
    category: 'survival'
  }
];

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: defaultGameState,
  player: defaultPlayer,
  singleMode: defaultSingleMode,
  achievements: defaultAchievements,
  sounds: defaultSounds,
  showElectricSparks: false,
  sparksIntensity: 'medium',
  showScreenShake: false,
  levelUpNotification: {
    isVisible: false,
    level: null,
    voltsReward: 0
  },

  // Actions
  startSingleMode: (difficulty) => {
    set({
      gameState: {
        ...get().gameState,
        mode: 'single',
        isPlaying: true,
        gameTime: 0,
        score: 0
      },
      singleMode: {
        ...defaultSingleMode,
        difficulty
      }
    });
  },

  clickOutlet: () => {
    const state = get();
    const now = Date.now();
    const timeSinceLastClick = now - state.singleMode.lastClickTime;
    
    // Calculate risk level based on timing
    let currentRisk: SingleModeState['currentRisk'] = 'low';
    if (timeSinceLastClick < 1000) currentRisk = 'extreme';
    else if (timeSinceLastClick < 2000) currentRisk = 'high';
    else if (timeSinceLastClick < 3000) currentRisk = 'medium';

    // Calculate danger level (affects warning signs)
    const dangerLevel = Math.min(100, 
      (state.singleMode.streakCount * 2) + // Больше серия = больше опасность
      (currentRisk === 'extreme' ? 40 : 
       currentRisk === 'high' ? 25 : 
       currentRisk === 'medium' ? 15 : 5) + // Риск влияет на опасность
      (state.player.luckCoefficient < 30 ? 20 : 0) // Низкая удача = больше опасность
    );

    // Activate warning signs if danger is high
    const warningSignsActive = dangerLevel > 60;

    // Update click stats
    set({
      player: {
        ...state.player,
        totalClicks: state.player.totalClicks + 1
      },
      singleMode: {
        ...state.singleMode,
        lastClickTime: now,
        currentRisk,
        dangerLevel,
        warningSignsActive
      }
    });

    // Update luck coefficient and restore indicator if needed
    get().updateLuckCoefficient();
  },

  updateScore: (scoreData: ScoreData) => {
    const state = get();
    const newScore = state.gameState.score + scoreData.totalPoints;
    const newVolts = state.player.volts + scoreData.totalPoints;
    
    // Update streak if it was a success
    const isSuccess = scoreData.reason !== 'Поражение током';
    const newStreak = isSuccess ? state.player.streak + 1 : 0;
    const newStreakCount = isSuccess ? state.singleMode.streakCount + 1 : 0;
    
    // Calculate experience based on action
    let experienceGained = 0;
    if (isSuccess) {
      // Base experience for successful click
      experienceGained = EXPERIENCE_REWARDS.SAFE_CLICK;
      
      // Bonus experience for risky clicks
      if (scoreData.riskMultiplier >= 2.0) {
        experienceGained = EXPERIENCE_REWARDS.RISKY_CLICK;
      }
      if (scoreData.riskMultiplier >= 3.0) {
        experienceGained = EXPERIENCE_REWARDS.EXTREME_CLICK;
      }
      
      // Bonus experience for streaks
      if (newStreak === 5) experienceGained += EXPERIENCE_REWARDS.STREAK_5;
      if (newStreak === 10) experienceGained += EXPERIENCE_REWARDS.STREAK_10;
      if (newStreak === 25) experienceGained += EXPERIENCE_REWARDS.STREAK_25;
      if (newStreak === 50) experienceGained += EXPERIENCE_REWARDS.STREAK_50;
    } else {
      // Small experience even for getting shocked
      experienceGained = EXPERIENCE_REWARDS.SHOCK_SURVIVAL;
    }
    
    // Update success/shock statistics and calculate luck coefficient
    const newSuccessfulClicks = isSuccess ? state.player.successfulClicks + 1 : state.player.successfulClicks;
    const newShockedClicks = !isSuccess ? state.player.shockedClicks + 1 : state.player.shockedClicks;
    const totalAttempts = newSuccessfulClicks + newShockedClicks;
    const newLuckCoefficient = totalAttempts > 0 ? Math.round((newSuccessfulClicks / totalAttempts) * 100) : 50;
    
    set({
      gameState: {
        ...state.gameState,
        score: newScore
      },
      player: {
        ...state.player,
        volts: newVolts,
        streak: newStreak,
        successfulClicks: newSuccessfulClicks,
        shockedClicks: newShockedClicks,
        luckCoefficient: newLuckCoefficient
      },
      singleMode: {
        ...state.singleMode,
        streakCount: newStreakCount
      }
    });

    // Add experience
    const { addExperience } = get();
    addExperience(experienceGained);

    // Check for achievements
    const { unlockAchievement } = get();
    if (state.player.totalClicks === 0) {
      unlockAchievement('first_click');
    }
    if (newStreak === 5) unlockAchievement('survivor_5');
    if (newStreak === 10) unlockAchievement('survivor_10');
    if (newStreak === 25) unlockAchievement('survivor_25');
  },

  // Рассчитывает урон от удара током на основе накопленных вольт
  calculateShockImpact: (volts: number): ShockImpact => {
    let damage: number;
    let severity: 'mild' | 'moderate' | 'severe' | 'critical';
    let duration: number;
    let luckHideDuration: number;

    if (volts < 50) {
      damage = Math.floor(volts * 0.1) + 1; // 1-5 очков
      severity = 'mild';
      duration = 1000;
      luckHideDuration = 2000;
    } else if (volts < 150) {
      damage = Math.floor(volts * 0.15) + 5; // 5-27 очков
      severity = 'moderate';
      duration = 1500;
      luckHideDuration = 3000;
    } else if (volts < 300) {
      damage = Math.floor(volts * 0.2) + 10; // 10-70 очков
      severity = 'severe';
      duration = 2000;
      luckHideDuration = 5000;
    } else {
      damage = Math.floor(volts * 0.25) + 20; // 20+ очков
      severity = 'critical';
      duration = 3000;
      luckHideDuration = 8000;
    }

    const voltsDrained = Math.floor(volts * 0.7); // Теряем 70% вольт

    return {
      damage,
      voltsDrained,
      duration,
      severity,
      luckHideDuration
    };
  },

  triggerShock: () => {
    const state = get();
    if (!state.gameState.isPlaying) return;

    // Рассчитываем урон на основе накопленных вольт
    const shockImpact = state.calculateShockImpact(state.player.volts);
    
    set({
      player: {
        ...state.player,
        volts: Math.max(0, state.player.volts - shockImpact.voltsDrained),
        shockedClicks: state.player.shockedClicks + 1,
        totalClicks: state.player.totalClicks + 1,
        streak: 0,
        luckIndicatorHidden: true,
        luckHiddenUntil: Date.now() + shockImpact.luckHideDuration
      },
      showElectricSparks: true,
      sparksIntensity: shockImpact.severity === 'critical' ? 'extreme' : 
                      shockImpact.severity === 'severe' ? 'high' :
                      shockImpact.severity === 'moderate' ? 'medium' : 'low',
      showScreenShake: true,
      gameState: {
        ...state.gameState,
        score: Math.max(0, state.gameState.score - shockImpact.damage)
      },
      singleMode: {
        ...state.singleMode,
        streakCount: 0
      }
    });

    // Отключаем эффекты после анимации
    setTimeout(() => {
      set({
        showElectricSparks: false,
        showScreenShake: false
      });
    }, shockImpact.duration);

    // Обновляем коэффициент удачи
    get().updateLuckCoefficient();
  },

  endGame: () => {
    set({
      gameState: {
        ...get().gameState,
        mode: 'menu',
        isPlaying: false
      }
    });
  },

  unlockAchievement: (achievementId: string) => {
    const state = get();
    const achievement = state.achievements.find(a => a.id === achievementId);
    
    if (achievement && !achievement.completed) {
      set({
        achievements: state.achievements.map(a =>
          a.id === achievementId 
            ? { ...a, completed: true, progress: a.requirement }
            : a
        ),
        player: {
          ...state.player,
          volts: state.player.volts + achievement.reward
        }
      });
    }
  },

  updatePlayerStats: (stats: Partial<Player>) => {
    const state = get();
    set({
      player: {
        ...state.player,
        ...stats
      }
    });
  },

  addExperience: (amount: number) => {
    const state = get();
    const newExperience = state.player.experience + amount;
    const oldLevel = calculateLevel(state.player.experience);
    const newLevel = calculateLevel(newExperience);
    
    // Check if player leveled up
    if (newLevel.level > oldLevel.level) {
      // Player leveled up! Give rewards
      const newVolts = state.player.volts + newLevel.voltsReward;
      
      set({
        player: {
          ...state.player,
          experience: newExperience,
          level: newLevel.level,
          volts: newVolts
        }
      });
      
      // Show level up notification
      const { showLevelUpNotification } = get();
      showLevelUpNotification(newLevel, newLevel.voltsReward);
    } else {
      // Just add experience
      set({
        player: {
          ...state.player,
          experience: newExperience
        }
      });
    }
  },

  getCurrentLevelInfo: () => {
    const state = get();
    return {
      currentLevel: calculateLevel(state.player.experience),
      progressInfo: getExperienceToNextLevel(state.player.experience)
    };
  },

  showLevelUpNotification: (level, voltsReward) => {
    set({
      levelUpNotification: {
        isVisible: true,
        level,
        voltsReward
      }
    });
  },

  hideLevelUpNotification: () => {
    set({
      levelUpNotification: {
        isVisible: false,
        level: null,
        voltsReward: 0
      }
    });
  },

  updateLuckCoefficient: () => {
    const state = get();
    const totalAttempts = state.player.totalClicks;
    const successfulClicks = state.player.successfulClicks;
    
    const newLuckCoefficient = totalAttempts > 0 ? 
      Math.round((successfulClicks / totalAttempts) * 100) : 50;
    
    // Проверяем, нужно ли восстанавливать индикатор удачи
    const shouldRestoreLuckIndicator = state.player.luckIndicatorHidden && 
                                      Date.now() >= state.player.luckHiddenUntil;
    
    set({
      player: {
        ...state.player,
        luckCoefficient: newLuckCoefficient,
        luckIndicatorHidden: shouldRestoreLuckIndicator ? false : state.player.luckIndicatorHidden
      }
    });
  },

  // API integration methods
  submitGameToServer: async () => {
    const state = get();
    
    // Проверяем, аутентифицирован ли пользователь
    if (!apiClient.isAuthenticated()) {
      console.warn('User not authenticated, skipping server submission');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Подготавливаем данные для отправки
      const gameData = {
        score: state.gameState.score,
        level: getDifficultyLevel(state.singleMode.difficulty),
        timePlayed: Math.floor(state.gameState.gameTime / 1000), // в секундах
      };

      console.log('Submitting game data to server:', gameData);

      const response = await apiClient.submitScore(gameData);

      if (response.error) {
        console.error('Failed to submit score:', response.error);
        return { success: false, error: response.error };
      }

      if (response.data) {
        // Обновляем локальное состояние данными с сервера
        const serverData = response.data;
        
        set({
          player: {
            ...state.player,
            volts: serverData.totalVolts,
            experience: serverData.totalExperience,
            level: serverData.newLevel
          }
        });

        // Показываем уведомление о повышении уровня, если было
        if (serverData.leveledUp) {
          const { showLevelUpNotification } = get();
          showLevelUpNotification(
            { level: serverData.newLevel }, 
            serverData.levelUpReward
          );
        }

        console.log('Successfully submitted score and synced with server');
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting game to server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  syncWithServer: async () => {
    if (!apiClient.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await apiClient.getUserStats();

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        const serverData = response.data;
        
        // Обновляем локальное состояние данными с сервера
        set({
          player: {
            ...get().player,
            volts: serverData.totalVolts,
            experience: serverData.totalExperience,
            level: serverData.level
          }
        });

        console.log('Successfully synced with server');
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error syncing with server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  loadStatsFromServer: async () => {
    if (!apiClient.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await apiClient.getUserStats();

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        const serverData = response.data;
        
        // Полностью загружаем статистику с сервера
        set({
          player: {
            ...get().player,
            volts: serverData.totalVolts,
            experience: serverData.totalExperience,
            level: serverData.level
          }
        });

        console.log('Successfully loaded stats from server');
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading stats from server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}));

// Вспомогательная функция для преобразования сложности в числовой уровень
function getDifficultyLevel(difficulty: SingleModeState['difficulty']): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    case 'extreme': return 4;
    default: return 1;
  }
}
