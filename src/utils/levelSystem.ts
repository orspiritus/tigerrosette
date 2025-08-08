// Level System Configuration
export interface LevelConfig {
  level: number;
  requiredExperience: number;
  voltsReward: number;
  title: string;
  description: string;
}

// Experience required for each level (cumulative) - Extremely balanced progression
export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, requiredExperience: 0, voltsReward: 0, title: "Новичок", description: "Первые шаги с электричеством" },
  { level: 2, requiredExperience: 5000, voltsReward: 50, title: "Ученик", description: "Осваиваете основы" },
  { level: 3, requiredExperience: 15000, voltsReward: 75, title: "Практикант", description: "⚠️ Опасно! Теперь удар током отнимает очки" },
  { level: 4, requiredExperience: 35000, voltsReward: 100, title: "Любитель", description: "🔥 Критично! Напряжение отнимается от очков" },
  { level: 5, requiredExperience: 70000, voltsReward: 150, title: "Энтузиаст", description: "Проявляете смелость в опасной игре" },
  { level: 6, requiredExperience: 125000, voltsReward: 200, title: "Смельчак", description: "Не боитесь рисковать" },
  { level: 7, requiredExperience: 200000, voltsReward: 250, title: "Храбрец", description: "Идете на оправданный риск" },
  { level: 8, requiredExperience: 300000, voltsReward: 300, title: "Отважный", description: "Покоряете сложности" },
  { level: 9, requiredExperience: 450000, voltsReward: 400, title: "Безрассудный", description: "Играете с опасностью" },
  { level: 10, requiredExperience: 650000, voltsReward: 500, title: "Профессионал", description: "Мастерски владеете риском" },
  { level: 11, requiredExperience: 900000, voltsReward: 600, title: "Эксперт", description: "Знаете все тонкости" },
  { level: 12, requiredExperience: 1200000, voltsReward: 750, title: "Мастер", description: "Превосходите ожидания" },
  { level: 13, requiredExperience: 1600000, voltsReward: 900, title: "Виртуоз", description: "Играете как художник" },
  { level: 14, requiredExperience: 2100000, voltsReward: 1100, title: "Гуру", description: "Достигли просветления" },
  { level: 15, requiredExperience: 2700000, voltsReward: 1300, title: "Сенсей", description: "Учите других" },
  { level: 16, requiredExperience: 3500000, voltsReward: 1500, title: "Легенда", description: "О вас слагают легенды" },
  { level: 17, requiredExperience: 4500000, voltsReward: 1750, title: "Миф", description: "Недостижимый идеал" },
  { level: 18, requiredExperience: 5800000, voltsReward: 2000, title: "Титан", description: "Сверхчеловеческие способности" },
  { level: 19, requiredExperience: 7500000, voltsReward: 2300, title: "Бог Электричества", description: "Повелеваете молниями" },
  { level: 20, requiredExperience: 10000000, voltsReward: 2500, title: "Зевс", description: "Абсолютная власть над током" },
];

// Calculate level from total experience
export function calculateLevel(totalExperience: number): LevelConfig {
  let currentLevel = LEVEL_CONFIGS[0];
  
  for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (totalExperience >= LEVEL_CONFIGS[i].requiredExperience) {
      currentLevel = LEVEL_CONFIGS[i];
      break;
    }
  }
  
  return currentLevel;
}

// Calculate experience needed for next level
export function getExperienceToNextLevel(totalExperience: number): {
  current: number;
  required: number;
  remaining: number;
  nextLevel: LevelConfig | null;
} {
  const currentLevel = calculateLevel(totalExperience);
  const nextLevelIndex = LEVEL_CONFIGS.findIndex(config => config.level === currentLevel.level) + 1;
  
  if (nextLevelIndex >= LEVEL_CONFIGS.length) {
    return {
      current: totalExperience,
      required: totalExperience,
      remaining: 0,
      nextLevel: null
    };
  }
  
  const nextLevel = LEVEL_CONFIGS[nextLevelIndex];
  
  return {
    current: totalExperience - currentLevel.requiredExperience,
    required: nextLevel.requiredExperience - currentLevel.requiredExperience,
    remaining: nextLevel.requiredExperience - totalExperience,
    nextLevel
  };
}

// Get level progress percentage
export function getLevelProgress(totalExperience: number): number {
  const { current, required } = getExperienceToNextLevel(totalExperience);
  if (required === 0) return 100;
  return Math.min(100, (current / required) * 100);
}

// Experience rewards for different actions - Rebalanced for better progression
export const EXPERIENCE_REWARDS = {
  SAFE_CLICK: 3,        // Увеличено с 1 до 3
  RISKY_CLICK: 8,       // Увеличено с 2 до 8
  EXTREME_CLICK: 15,    // Увеличено с 3 до 15
  STREAK_5: 25,         // Увеличено с 5 до 25
  STREAK_10: 60,        // Увеличено с 12 до 60
  STREAK_25: 150,       // Увеличено с 30 до 150
  STREAK_50: 300,       // Увеличено с 60 до 300
  SURVIVAL_MINUTE: 10,  // Увеличено с 2 до 10
  SHOCK_SURVIVAL: 5,    // Увеличено с 1 до 5
  ACHIEVEMENT: 50,      // Увеличено с 10 до 50
  DAILY_BONUS: 100      // Увеличено с 20 до 100
} as const;

// Get outlet image based on player level - Adjusted for new level system
export function getOutletImageByLevel(level: number): string {
  // We have 4 different outlet images (tigrrozetka_1.png to tigrrozetka_4.png)
  // Cycle through them based on level ranges
  
  const basePath = '/tigerrosette/';
  
  if (level <= 3) {
    return `${basePath}Media/Pictures/tigrrozetka_1.png`;
  } else if (level <= 7) {
    return `${basePath}Media/Pictures/tigrrozetka_2.png`;
  } else if (level <= 12) {
    return `${basePath}Media/Pictures/tigrrozetka_3.png`;
  } else {
    return `${basePath}Media/Pictures/tigrrozetka_4.png`;
  }
}
