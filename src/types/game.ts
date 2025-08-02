// Game Types
export interface GameState {
  mode: 'menu' | 'single' | 'multiplayer';
  isPlaying: boolean;
  isPaused: boolean;
  gameTime: number;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  volts: number;
  level: number;
  experience: number;
  streak: number;
  totalClicks: number;
  survivalTime: number;
}

// Single Mode Types
export interface SingleModeState {
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  aiPattern: 'regular' | 'burst' | 'random' | 'adaptive';
  currentRisk: 'low' | 'medium' | 'high' | 'extreme';
  streakCount: number;
  timeInSafeZone: number;
  lastClickTime: number;
  warningActive: boolean;
  shockActive: boolean;
}

export interface ScoreData {
  basePoints: number;
  riskMultiplier: number;
  streakBonus: number;
  timeBonus: number;
  totalPoints: number;
  reason: string;
}

// AI Electrician Configuration
export interface AIElectricianConfig {
  shockProbability: number;
  warningTime: number;
  safeWindow: number;
  minInterval: number;
  maxInterval: number;
}

// Visual Effects
export interface SparkEffect {
  id: string;
  x: number;
  y: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  duration: number;
  color: string;
}

export interface ElectricEffect {
  isActive: boolean;
  intensity: number;
  duration: number;
  pattern: 'single' | 'burst' | 'continuous';
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  completed: boolean;
  reward: number;
  category: 'streak' | 'survival' | 'risk' | 'special';
}

// Sound Effects
export type SoundType = 
  | 'click' 
  | 'spark' 
  | 'shock' 
  | 'warning' 
  | 'success' 
  | 'achievement' 
  | 'background';

export interface SoundConfig {
  volume: number;
  enabled: boolean;
  backgroundMusicEnabled: boolean;
}

// Store Types
export interface GameStore {
  // State
  gameState: GameState;
  player: Player;
  singleMode: SingleModeState;
  achievements: Achievement[];
  sounds: SoundConfig;
  levelUpNotification: {
    isVisible: boolean;
    level?: any;
    voltsReward?: number;
  };
  
  // Actions
  startSingleMode: (difficulty: SingleModeState['difficulty']) => void;
  clickOutlet: () => void;
  updateScore: (scoreData: ScoreData) => void;
  triggerShock: () => void;
  triggerWarning: () => void;
  endGame: () => void;
  unlockAchievement: (achievementId: string) => void;
  updatePlayerStats: (stats: Partial<Player>) => void;
  addExperience: (amount: number) => void;
  getCurrentLevelInfo: () => {
    currentLevel: any;
    progressInfo: any;
  };
  showLevelUpNotification: (level: any, voltsReward: number) => void;
  hideLevelUpNotification: () => void;
}
