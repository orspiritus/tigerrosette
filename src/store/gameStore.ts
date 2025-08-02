import { create } from 'zustand';
import { GameStore, GameState, Player, SingleModeState, Achievement, ScoreData, SoundConfig } from '../types/game';
import { calculateLevel, getExperienceToNextLevel, EXPERIENCE_REWARDS } from '../utils/levelSystem';

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
  survivalTime: 0
};

const defaultSingleMode: SingleModeState = {
  difficulty: 'easy',
  aiPattern: 'regular',
  currentRisk: 'low',
  streakCount: 0,
  timeInSafeZone: 0,
  lastClickTime: 0,
  warningActive: false,
  shockActive: false
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

    // Update click stats
    set({
      player: {
        ...state.player,
        totalClicks: state.player.totalClicks + 1
      },
      singleMode: {
        ...state.singleMode,
        lastClickTime: now,
        currentRisk
      }
    });
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
    
    set({
      gameState: {
        ...state.gameState,
        score: newScore
      },
      player: {
        ...state.player,
        volts: newVolts,
        streak: newStreak
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

  triggerShock: () => {
    const state = get();
    let newScore = state.gameState.score;
    let newVolts = state.player.volts;
    let penaltyMessage = '';

    // Calculate penalties based on player level
    const playerLevel = calculateLevel(state.player.experience).level;
    
    if (playerLevel >= 4) {
      // С 4-го уровня: отнимаем напряжение от очков
      const voltsPenalty = Math.min(state.player.volts, Math.floor(state.gameState.score * 0.1)); // 10% от очков или все вольты
      newScore = Math.max(0, state.gameState.score - voltsPenalty);
      penaltyMessage = `Потеряно ${voltsPenalty} очков (напряжение)!`;
    } else if (playerLevel >= 3) {
      // С 3-го уровня: отнимаем очки
      const scorePenalty = Math.floor(state.gameState.score * 0.05); // 5% от текущих очков
      newScore = Math.max(0, state.gameState.score - scorePenalty);
      penaltyMessage = `Потеряно ${scorePenalty} очков!`;
    }

    set({
      gameState: {
        ...state.gameState,
        score: newScore
      },
      singleMode: {
        ...state.singleMode,
        shockActive: true,
        streakCount: 0
      },
      player: {
        ...state.player,
        streak: 0,
        volts: newVolts
      }
    });

    // Show penalty message if there was one
    if (penaltyMessage && typeof window !== 'undefined') {
      // Store penalty message for UI to show
      (window as any).lastPenaltyMessage = penaltyMessage;
    }

    // Reset shock after animation
    setTimeout(() => {
      set({
        singleMode: {
          ...get().singleMode,
          shockActive: false
        }
      });
    }, 500);
  },

  triggerWarning: () => {
    const state = get();
    set({
      singleMode: {
        ...state.singleMode,
        warningActive: true
      }
    });

    // Reset warning after timeout
    setTimeout(() => {
      set({
        singleMode: {
          ...get().singleMode,
          warningActive: false
        }
      });
    }, 2000);
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
  }
}));
