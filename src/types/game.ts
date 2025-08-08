// Game Types
export interface GameState {
  mode: 'menu' | 'single' | 'multiplayer' | 'duel' | 'duel-invite';
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
  protection: PlayerProtection; // Защитные средства
}

// Защитные средства игрока
export interface PlayerProtection {
  gloves: ProtectionItem; // Перчатки
  boots: ProtectionItem; // Ботинки
  suit: ProtectionItem; // Костюм
  helmet: ProtectionItem; // Шлем
}

// Элемент защиты
export interface ProtectionItem {
  level: number; // Уровень защиты (0-5)
  protection: number; // Процент защиты от урона (0-95%)
  durability: number; // Прочность (0-100%)
  maxDurability: number; // Максимальная прочность
}

// Предмет в магазине
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'gloves' | 'boots' | 'suit' | 'helmet';
  level: number;
  protection: number;
  durability: number;
  price: number;
  icon: string;
}

// AI Electrician System
export interface AIElectrician {
  name: string; // Имя электрика
  energy: number; // Энергия (0-100)
  maxEnergy: number; // Максимальная энергия
  voltage: number; // Накопленное напряжение для атак
  maxVoltage: number; // Максимальное напряжение
  voltageChargeRate: number; // Скорость набора напряжения
  lastAttackTime: number; // Время последней атаки на игрока
  equipment: {
    battery: number; // Состояние аккумулятора (0-100)
    capacitor: number; // Состояние конденсатора (0-100)
    wires: number; // Состояние проводов (0-100)
    generator: number; // Состояние генератора (0-100)
  };
  mood: 'confident' | 'frustrated' | 'tired' | 'broken' | 'angry'; // Настроение
  experience: number; // Опыт (влияет на эффективность)
  isActive: boolean; // Активен ли
  lastMessage: string; // Последнее сообщение
  messageTime: number; // Время последнего сообщения
  failuresCount: number; // Количество неудач
  successfulDischarges: number; // Успешные разряды
  playerAttacksReceived: number; // Получено атак от игрока
  workingEfficiency: number; // Эффективность работы (0-100%)
  canWork: boolean; // Может ли работать (зависит от энергии и оборудования)
  fatigueLevel: number; // Уровень усталости (0-10) для отслеживания дропа предметов
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
  
  // AI Electrician System
  aiElectricianActive: boolean; // Активен ли ИИ электрик
  nextDischargeTime: number; // Время следующего разряда (timestamp)
  dischargeWarningTime: number; // Время начала предупреждения (timestamp)
  isDischarging: boolean; // Происходит ли разряд сейчас
  dischargeDuration: number; // Длительность разряда в мс
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
  severity: 'mild' | 'moderate' | 'severe' | 'critical'; // Уровень серьезности
  luckHideDuration: number; // Время скрытия индикатора удачи
}

// Achievements
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  completed: boolean;
  reward: number;
  category: 'special' | 'streak' | 'risk' | 'survival';
}

// Audio
export interface SoundConfig {
  volume: number;
  enabled: boolean;
  backgroundMusicEnabled: boolean;
}

// API Types  
export interface SparkEffect {
  id: string;
  x: number;
  y: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: number;
  duration: number;
  color: string;
}

export interface GameMode {
  name: string;
  description: string;
  icon: string;
}

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
  aiElectrician: AIElectrician; // ИИ электрик
  levelUpNotification: {
    isVisible: boolean;
    level: any | null;
    voltsReward: number;
  };
  
  // Actions
  startSingleMode: (difficulty: SingleModeState['difficulty']) => void;
  startMultiplayerMode: (mode: 'duel' | 'tournament' | 'coop') => void;
  startRealDuel: () => void;
  goToMenu: () => void;
  clickOutlet: () => void;
  updateScore: (scoreData: ScoreData) => void;
  calculateShockImpact: (volts: number) => ShockImpact;
  triggerShock: () => void;
  updateLuckCoefficient: () => void;
  
  // AI Electrician System
  startAIElectrician: () => void;
  stopAIElectrician: () => void;
  restartAIElectrician: () => void;
  scheduleNextDischarge: () => void;
  checkForDischarge: () => void;
  updateAIElectrician: () => void;
  damageAIElectrician: (damageType: 'energy' | 'equipment', amount?: number, isPlayerAttack?: boolean) => void;
  aiElectricianAttackPlayer: () => void;
  repairAIElectrician: (repairType: 'energy' | 'equipment') => void;
  dropElectricianItem: () => void;
  getAIElectricianMessage: () => string;
  
  endGame: () => void;
  unlockAchievement: (achievementId: string) => void;
  updatePlayerStats: (stats: Partial<Player>) => void;
  addExperience: (amount: number) => void;
  fixPlayerLevel: () => void;
  compensateExperience: () => number;
  getCurrentLevelInfo: () => {
    currentLevel: any;
    progressInfo: any;
  };
  showLevelUpNotification: (level: any, voltsReward: number) => void;
  hideLevelUpNotification: () => void;
  
  // Shop system
  buyProtectionItem: (type: keyof PlayerProtection, level: number) => boolean;
  getShopItems: () => ShopItem[];
  getTotalProtection: () => number;
  damageProtection: (damage: number) => void;
  
  // API integration methods
  submitGameToServer: () => Promise<{ success: boolean; error?: string }>;
  syncWithServer: () => Promise<{ success: boolean; error?: string }>;
  loadStatsFromServer: () => Promise<{ success: boolean; error?: string }>;
}
