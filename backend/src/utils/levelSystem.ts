/**
 * Level system utilities for calculating user levels and progress
 */

// Experience required for each level (cumulative)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
  5500,   // Level 11
  6600,   // Level 12
  7800,   // Level 13
  9100,   // Level 14
  10500,  // Level 15
  12000,  // Level 16
  13600,  // Level 17
  15300,  // Level 18
  17100,  // Level 19
  19000,  // Level 20
];

/**
 * Calculate user level based on total experience
 */
export function calculateLevel(totalExperience: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i];
    if (threshold !== undefined && totalExperience >= threshold) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calculate level progress (percentage to next level)
 */
export function calculateLevelProgress(totalExperience: number): {
  currentLevel: number;
  currentLevelExperience: number;
  nextLevelExperience: number;
  experienceToNext: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevel(totalExperience);
  
  // If at max level
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return {
      currentLevel,
      currentLevelExperience: totalExperience,
      nextLevelExperience: totalExperience,
      experienceToNext: 0,
      progressPercentage: 100,
    };
  }
  
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]! + 1000);
  
  const currentLevelExperience = totalExperience - currentLevelThreshold;
  const experienceNeededForLevel = nextLevelThreshold - currentLevelThreshold;
  const experienceToNext = nextLevelThreshold - totalExperience;
  
  const progressPercentage = Math.min(100, (currentLevelExperience / experienceNeededForLevel) * 100);
  
  return {
    currentLevel,
    currentLevelExperience,
    nextLevelExperience: nextLevelThreshold,
    experienceToNext,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
  };
}

/**
 * Get experience required for a specific level
 */
export function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > LEVEL_THRESHOLDS.length) {
    // For levels beyond the threshold table, use exponential growth
    const baseExperience = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!;
    const additionalLevels = level - LEVEL_THRESHOLDS.length;
    return baseExperience + (additionalLevels * 1000);
  }
  return LEVEL_THRESHOLDS[level - 1] || 0;
}

/**
 * Get all level thresholds
 */
export function getLevelThresholds(): number[] {
  return [...LEVEL_THRESHOLDS];
}
