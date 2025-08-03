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
  successfulClicks: number;
  shockedClicks: number;
  luckCoefficient: number; // Коэффициент удачи (0-100%)
  luckIndicatorHidden: boolean; // Скрыт ли индикатор удачи
  luckHiddenUntil: number; // Время до которого скрыт индикатор (timestamp)
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
  dangerLevel: number; // Уровень опасности (0-100%)
  warningSignsActive: boolean; // Активны ли предупреждающие знаки
}

export interface ScoreData {
  basePoints: number;
  riskMultiplier: number;
  streakBonus: number;
  timeBonus: number;
  totalPoints: number;
  reason: string;
}

// Shock Impact System
export interface ShockImpact {
  damage: number; // Урон в очках
  voltsDrained: number; // Потерянные вольты
  duration: number; // Длительность эффекта в мс
  severity: 'mild' | 'moderate' | 'severe' | 'critical'; // Тяжесть поражения
  luckHideDuration: number; // Время скрытия индикатора удачи в мс
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
  showElectricSparks: boolean;
  sparksIntensity: 'low' | 'medium' | 'high' | 'extreme';
  showScreenShake: boolean;
  levelUpNotification: {
    isVisible: boolean;
    level: any | null;
    voltsReward: number;
  };
  
  // Actions
  startSingleMode: (difficulty: SingleModeState['difficulty']) => void;
  clickOutlet: () => void;
  updateScore: (scoreData: ScoreData) => void;
  calculateShockImpact: (volts: number) => ShockImpact;
  triggerShock: () => void;
  updateLuckCoefficient: () => void;
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
  
  // API integration methods
  submitGameToServer: () => Promise<{ success: boolean; error?: string }>;
  syncWithServer: () => Promise<{ success: boolean; error?: string }>;
  loadStatsFromServer: () => Promise<{ success: boolean; error?: string }>;
}
