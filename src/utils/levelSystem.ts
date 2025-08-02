// Level System Configuration
export interface LevelConfig {
  level: number;
  requiredExperience: number;
  voltsReward: number;
  title: string;
  description: string;
}

// Experience required for each level (cumulative)
export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, requiredExperience: 0, voltsReward: 0, title: "Новичок", description: "Первые шаги с электричеством" },
  { level: 2, requiredExperience: 100, voltsReward: 50, title: "Ученик", description: "Осваиваете основы" },
  { level: 3, requiredExperience: 250, voltsReward: 75, title: "Практикант", description: "⚠️ Опасно! Теперь удар током отнимает очки" },
  { level: 4, requiredExperience: 500, voltsReward: 100, title: "Любитель", description: "🔥 Критично! Напряжение отнимается от очков" },
  { level: 5, requiredExperience: 850, voltsReward: 150, title: "Энтузиаст", description: "Проявляете смелость в опасной игре" },
  { level: 6, requiredExperience: 1300, voltsReward: 200, title: "Смельчак", description: "Не боитесь рисковать" },
  { level: 7, requiredExperience: 1900, voltsReward: 250, title: "Храбрец", description: "Идете на оправданный риск" },
  { level: 8, requiredExperience: 2600, voltsReward: 300, title: "Отважный", description: "Покоряете сложности" },
  { level: 9, requiredExperience: 3450, voltsReward: 400, title: "Безрассудный", description: "Играете с опасностью" },
  { level: 10, requiredExperience: 4500, voltsReward: 500, title: "Профессионал", description: "Мастерски владеете риском" },
  { level: 11, requiredExperience: 5800, voltsReward: 600, title: "Эксперт", description: "Знаете все тонкости" },
  { level: 12, requiredExperience: 7400, voltsReward: 750, title: "Мастер", description: "Превосходите ожидания" },
  { level: 13, requiredExperience: 9300, voltsReward: 900, title: "Виртуоз", description: "Играете как художник" },
  { level: 14, requiredExperience: 11600, voltsReward: 1100, title: "Гуру", description: "Достигли просветления" },
  { level: 15, requiredExperience: 14400, voltsReward: 1300, title: "Сенсей", description: "Учите других" },
  { level: 16, requiredExperience: 17800, voltsReward: 1500, title: "Легенда", description: "О вас слагают легенды" },
  { level: 17, requiredExperience: 21900, voltsReward: 1750, title: "Миф", description: "Недостижимый идеал" },
  { level: 18, requiredExperience: 26800, voltsReward: 2000, title: "Титан", description: "Сверхчеловеческие способности" },
  { level: 19, requiredExperience: 32600, voltsReward: 2300, title: "Бог Электричества", description: "Повелеваете молниями" },
  { level: 20, requiredExperience: 40000, voltsReward: 2500, title: "Зевс", description: "Абсолютная власть над током" },
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

// Experience rewards for different actions
export const EXPERIENCE_REWARDS = {
  SAFE_CLICK: 10,
  RISKY_CLICK: 15,
  EXTREME_CLICK: 25,
  STREAK_5: 50,
  STREAK_10: 100,
  STREAK_25: 250,
  STREAK_50: 500,
  SURVIVAL_MINUTE: 20,
  SHOCK_SURVIVAL: 5,
  ACHIEVEMENT: 100,
  DAILY_BONUS: 200
} as const;

// Get outlet image based on player level
export function getOutletImageByLevel(level: number): string {
  // We have 4 different outlet images (tigrrozetka_1.png to tigrrozetka_4.png)
  // Cycle through them based on level ranges
  
  const basePath = '/tigerrosette/';
  
  if (level <= 5) {
    return `${basePath}Media/Pictures/tigrrozetka_1.png`;
  } else if (level <= 10) {
    return `${basePath}Media/Pictures/tigrrozetka_2.png`;
  } else if (level <= 15) {
    return `${basePath}Media/Pictures/tigrrozetka_3.png`;
  } else {
    return `${basePath}Media/Pictures/tigrrozetka_4.png`;
  }
}
