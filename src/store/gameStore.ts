import { create } from 'zustand';
import { GameStore, GameState, Player, SingleModeState, Achievement, ScoreData, SoundConfig, ShockImpact, PlayerProtection, ShopItem } from '../types/game';
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
  survivalTime: 0,
  protection: {
    gloves: { level: 0, protection: 0, durability: 0, maxDurability: 0 },
    boots: { level: 0, protection: 0, durability: 0, maxDurability: 0 },
    suit: { level: 0, protection: 0, durability: 0, maxDurability: 0 },
    helmet: { level: 0, protection: 0, durability: 0, maxDurability: 0 }
  }
};

const defaultSingleMode: SingleModeState = {
  difficulty: 'easy',
  aiPattern: 'regular',
  currentRisk: 'low',
  streakCount: 0,
  timeInSafeZone: 0,
  lastClickTime: 0,
  dangerLevel: 0,
  warningSignsActive: false,
  stage: 1,
  
  // AI Electrician System
  aiElectricianActive: false,
  nextDischargeTime: 0,
  dischargeWarningTime: 0,
  isDischarging: false,
  dischargeDuration: 5000 // 5 секунд - увеличено для большей вероятности попадания
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
    title: 'Первое прикосновение',
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
    title: 'Живчик',
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
    title: 'Неубиваемый',
    description: 'Серия из 25 успешных нажатий',
    icon: '🛡️',
    requirement: 25,
    progress: 0,
    completed: false,
    reward: 500,
    category: 'streak'
  },
  {
    id: 'risk_taker',
    title: 'Безрассудный',
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
    title: 'Выживальщик',
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
  aiElectrician: {
    name: 'Иван Электрик',
    energy: 100,
    maxEnergy: 100,
    voltage: 0,
    maxVoltage: 500,
    voltageChargeRate: 2, // вольт в секунду
    lastAttackTime: 0,
    equipment: {
      battery: 100,
      capacitor: 100,
      wires: 100,
      generator: 100
    },
    mood: 'confident',
    experience: 50,
    isActive: false,
    lastMessage: 'Готов к работе!',
    messageTime: 0,
    failuresCount: 0,
    successfulDischarges: 0,
    playerAttacksReceived: 0,
    workingEfficiency: 100,
    canWork: true,
    fatigueLevel: 0, // Уровень усталости для отслеживания дропа предметов
    points: 0,
    maxPoints: 0
  },
  levelUpNotification: {
    isVisible: false,
    level: null,
    voltsReward: 0
  },

  // Actions
  startSingleMode: (difficulty) => {
    console.log('startSingleMode: Starting with difficulty:', difficulty);
    
    // Исправляем уровень игрока на основе опыта перед началом игры
    get().fixPlayerLevel();
    
    // Компенсируем недостающий опыт на основе очков (единоразово)
    const compensated = get().compensateExperience();
    if (compensated > 0) {
      console.log(`Compensated ${compensated} experience points based on current score`);
    }
    
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

    // Инициализируем очки ИИ на старте этапа
    set(state => ({
      aiElectrician: {
        ...state.aiElectrician,
        points: get().getAIMaxPointsForStage((get().singleMode.stage) || 1),
        maxPoints: get().getAIMaxPointsForStage((get().singleMode.stage) || 1)
      }
    }));

    // Запускаем ИИ электрика
    setTimeout(() => {
      console.log('startSingleMode: Starting AI Electrician after 3s delay');
      get().startAIElectrician();
    }, 3000); // Начинаем через 3 секунды после старта игры
  },

  startMultiplayerMode: (mode: 'duel' | 'tournament' | 'coop') => {
    let gameMode: 'multiplayer' | 'duel' | 'duel-invite' = 'multiplayer';
    
    // Если это дуэль, переходим к экрану приглашений
    if (mode === 'duel') {
      gameMode = 'duel-invite';
    }
    
    set({
      gameState: {
        ...get().gameState,
        mode: gameMode,
        isPlaying: false,
        gameTime: 0,
        score: 0
      }
    });
    
    console.log(`Starting multiplayer mode: ${mode}`);
  },

  // Новая функция для запуска реальной дуэли
  startRealDuel: () => {
    set({
      gameState: {
        ...get().gameState,
        mode: 'duel',
        isPlaying: true,
        gameTime: 0,
        score: 0
      }
    });
    
    console.log('Starting real duel with another player');
  },

  // Функция для возврата в главное меню
  goToMenu: () => {
    set({
      gameState: {
        ...defaultGameState,
        mode: 'menu'
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
    const isSuccess = scoreData.reason !== 'Поражение током' && 
                     scoreData.reason !== 'Клик во время разряда!' &&
                     scoreData.totalPoints > 0; // Дополнительная проверка на положительные очки
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
      
      // Бонусный опыт на основе набранных очков (1 опыт за каждые 10 очков)
      const scoreBonus = Math.floor(Math.max(0, scoreData.totalPoints) / 10);
      experienceGained += scoreBonus;
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

    // Симметричная система очков: успех игрока уменьшает очки ИИ
    if (isSuccess && scoreData.totalPoints > 0) {
      const ai = get().aiElectrician;
      const decrease = Math.max(1, Math.floor(scoreData.totalPoints / 2));
      set({
        aiElectrician: {
          ...ai,
          points: Math.max(0, ai.points - decrease)
        }
      });
      get().onAIPointsChanged();
    }

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
    const baseShockImpact = state.calculateShockImpact(state.player.volts);
    
    // Применяем защиту
    const totalProtection = state.getTotalProtection();
    const protectionMultiplier = (100 - totalProtection) / 100;
    const finalDamage = Math.floor(baseShockImpact.damage * protectionMultiplier);
    
    // Повреждаем защитное снаряжение
    state.damageProtection(baseShockImpact.damage);
    
  set({
      player: {
        ...state.player,
        volts: Math.max(0, state.player.volts - baseShockImpact.voltsDrained),
        shockedClicks: state.player.shockedClicks + 1,
        totalClicks: state.player.totalClicks + 1,
        streak: 0,
        luckIndicatorHidden: true,
        luckHiddenUntil: Date.now() + baseShockImpact.luckHideDuration
      },
      showElectricSparks: true,
      sparksIntensity: baseShockImpact.severity === 'critical' ? 'extreme' : 
                      baseShockImpact.severity === 'severe' ? 'high' :
                      baseShockImpact.severity === 'moderate' ? 'medium' : 'low',
      showScreenShake: true,
      gameState: {
        ...state.gameState,
        score: Math.max(0, state.gameState.score - finalDamage)
      },
      singleMode: {
        ...state.singleMode,
        streakCount: 0
      }
    });

    // Разряд от розетки в момент клика засчитываем как успех ИИ: увеличиваем очки ИИ
    set(s => ({
      aiElectrician: {
        ...s.aiElectrician,
        points: Math.min(s.aiElectrician.maxPoints, s.aiElectrician.points + Math.max(1, Math.floor(finalDamage / 2)))
      }
    }));
    get().onAIPointsChanged();

    // Отключаем эффекты после анимации
    setTimeout(() => {
      set({
        showElectricSparks: false,
        showScreenShake: false
      });
    }, baseShockImpact.duration);

    // Обновляем коэффициент удачи
    get().updateLuckCoefficient();
  },

  endGame: () => {
    // Останавливаем ИИ электрика
    get().stopAIElectrician();
    
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
    
    console.log('addExperience:', {
      amount,
      oldExperience: state.player.experience,
      newExperience,
      oldLevel: oldLevel.level,
      newLevel: newLevel.level,
      playerLevel: state.player.level
    });
    
    // Check if player leveled up
    if (newLevel.level > oldLevel.level) {
      console.log('LEVEL UP!', {
        from: oldLevel.level,
        to: newLevel.level,
        voltsReward: newLevel.voltsReward
      });
      
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
      // Just add experience and ensure level is correct
      set({
        player: {
          ...state.player,
          experience: newExperience,
          level: newLevel.level // Всегда обновляем уровень на основе опыта
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

  // Корректирует уровень игрока на основе текущего опыта
  fixPlayerLevel: () => {
    const state = get();
    const correctLevel = calculateLevel(state.player.experience);
    
    console.log('fixPlayerLevel:', {
      currentStoredLevel: state.player.level,
      correctLevel: correctLevel.level,
      experience: state.player.experience
    });
    
    if (state.player.level !== correctLevel.level) {
      console.log('Fixing player level from', state.player.level, 'to', correctLevel.level);
      set({
        player: {
          ...state.player,
          level: correctLevel.level
        }
      });
    }
  },

  // Функция для компенсации недостающего опыта на основе очков (единоразово)
  compensateExperience: () => {
    const state = get();
    const currentScore = state.gameState.score;
    const currentExperience = state.player.experience;
    
    // Рассчитываем сколько опыта должно быть у игрока на основе очков
    const expectedExperience = Math.floor(currentScore / 5); // 1 опыт за каждые 5 очков
    const missingExperience = Math.max(0, expectedExperience - currentExperience);
    
    console.log('compensateExperience:', {
      currentScore,
      currentExperience,
      expectedExperience,
      missingExperience
    });
    
    if (missingExperience > 0) {
      console.log(`Compensating ${missingExperience} experience points`);
      get().addExperience(missingExperience);
      return missingExperience;
    }
    
    return 0;
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

  // Служебная функция: максимум очков ИИ на этапе
  getAIMaxPointsForStage(stage: number) {
    const diff = get().singleMode.difficulty;
    const base = diff === 'extreme' ? 250 : diff === 'hard' ? 200 : diff === 'medium' ? 150 : 120;
    // Растет с этапом, но с плавным коэффициентом
    return base + Math.floor((stage - 1) * base * 0.25);
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

  // AI Electrician System
  startAIElectrician: () => {
    const state = get();
    if (!state.gameState.isPlaying) {
      console.log('startAIElectrician: Game not playing, aborting');
      return;
    }

    console.log('startAIElectrician: Starting AI Electrician');
    set({
      singleMode: {
        ...state.singleMode,
        aiElectricianActive: true
      },
      aiElectrician: {
        ...state.aiElectrician,
        isActive: true,
        lastMessage: get().getAIElectricianMessage(),
        messageTime: Date.now()
      }
    });

    // Запускаем периодическое обновление ИИ электрика (каждые 2 секунды)
    const aiUpdateInterval = setInterval(() => {
      const currentState = get();
      if (!currentState.singleMode.aiElectricianActive || !currentState.gameState.isPlaying) {
        console.log('startAIElectrician: Clearing AI update interval');
        clearInterval(aiUpdateInterval);
        return;
      }
      
      get().updateAIElectrician();
      
      // Обновляем сообщение каждые 5-10 секунд
      if (Math.random() < 0.3) {
        set({
          aiElectrician: {
            ...get().aiElectrician,
            lastMessage: get().getAIElectricianMessage(),
            messageTime: Date.now()
          }
        });
      }
    }, 2000);

    // Планируем первый разряд
    console.log('startAIElectrician: Scheduling first discharge');
    get().scheduleNextDischarge();
  },


        // Вызывается при изменении очков ИИ, отвечает за переходы этапов и атаки
        onAIPointsChanged: () => {
          const state = get();
          const ai = state.aiElectrician;
          if (!state.gameState.isPlaying) return;

          // Переход на следующий этап: очки ИИ исчерпаны
          if (ai.points <= 0) {
            const nextStage = state.singleMode.stage + 1;
            const nextMax = get().getAIMaxPointsForStage(nextStage);
            const voltsReward = 50 + nextStage * 10;
            set({
              player: { ...state.player, volts: state.player.volts + voltsReward },
              singleMode: { ...state.singleMode, stage: nextStage },
              aiElectrician: { ...ai, points: nextMax, maxPoints: nextMax, lastMessage: 'Этап пройден! Я выдохся...', messageTime: Date.now() }
            });
            // Шанс дропа предмета при переходе этапа
            if (Math.random() < 0.5) {
              setTimeout(() => get().dropElectricianItem(), 400);
            }
            return;
          }

          // ИИ накопил максимум очков — пытается ударить игрока током
          if (ai.points >= ai.maxPoints) {
            // Мощная атака
            get().aiElectricianAttackPlayer();
            // Сбрасываем очки до 60% и продолжаем этап
            const reduced = Math.floor(ai.maxPoints * 0.6);
            set({ aiElectrician: { ...ai, points: reduced } });
          }
        },

        // Явный переход на следующий этап
        advanceStage: () => {
          const state = get();
          const nextStage = state.singleMode.stage + 1;
          const nextMax = get().getAIMaxPointsForStage(nextStage);
          set({
            singleMode: { ...state.singleMode, stage: nextStage },
            aiElectrician: { ...state.aiElectrician, points: nextMax, maxPoints: nextMax }
          });
        },
  // Система дропа предметов от ИИ электрика
  dropElectricianItem: () => {
    const state = get();
    const fatigueLevel = Math.floor(state.aiElectrician.fatigueLevel);
    
    // Таблица дропа в зависимости от уровня усталости
    const getDropTable = (fatigue: number) => {
      if (fatigue >= 8) {
        return [
          { type: 'suit', level: 3, chance: 0.2, message: '🥽 ИИ электрик от усталости снял профессиональный костюм!' },
          { type: 'gloves', level: 3, chance: 0.3, message: '🧤 ИИ электрик уронил диэлектрические перчатки!' },
          { type: 'boots', level: 2, chance: 0.3, message: '👢 ИИ электрик оставил диэлектрические сапоги!' },
          { type: 'helmet', level: 2, chance: 0.2, message: '⛑️ ИИ электрик забыл диэлектрическую каску!' }
        ];
      } else if (fatigue >= 5) {
        return [
          { type: 'gloves', level: 2, chance: 0.4, message: '🧤 ИИ электрик потерял усиленные перчатки!' },
          { type: 'boots', level: 2, chance: 0.3, message: '👢 ИИ электрик оставил диэлектрические сапоги!' },
          { type: 'suit', level: 1, chance: 0.2, message: '🥽 ИИ электрик снял изолирующий костюм!' },
          { type: 'helmet', level: 1, chance: 0.1, message: '⛑️ ИИ электрик забыл каску!' }
        ];
      } else if (fatigue >= 2) {
        return [
          { type: 'gloves', level: 1, chance: 0.5, message: '🧤 ИИ электрик уронил резиновые перчатки!' },
          { type: 'boots', level: 1, chance: 0.3, message: '👢 ИИ электрик оставил резиновые сапоги!' },
          { type: 'helmet', level: 1, chance: 0.2, message: '⛑️ ИИ электрик забыл защитную каску!' }
        ];
      } else {
        return [
          { type: 'gloves', level: 1, chance: 0.7, message: '� ИИ электрик уронил рабочие перчатки!' },
          { type: 'boots', level: 1, chance: 0.3, message: '👢 ИИ электрик потерял сапог!' }
        ];
      }
    };
    
    const dropTable = getDropTable(fatigueLevel);
    
    // Выбираем случайный предмет на основе шансов
    const random = Math.random();
    let cumulativeChance = 0;
    let selectedItem = null;
    
    for (const item of dropTable) {
      cumulativeChance += item.chance;
      if (random <= cumulativeChance) {
        selectedItem = item;
        break;
      }
    }
    
    if (!selectedItem) return;
    
    const { type, level, message } = selectedItem;
    const typedType = type as keyof PlayerProtection;
    
    // Проверяем, есть ли уже у игрока этот предмет такого же или лучшего уровня
    const currentItem = state.player.protection[typedType];
    if (currentItem.level >= level) {
      console.log('Player already has better protection item:', type, level);
      // Даем вольты вместо предмета
      const voltBonus = level * 25;
      set({
        player: {
          ...state.player,
          volts: state.player.volts + voltBonus
        },
        aiElectrician: {
          ...state.aiElectrician,
          lastMessage: `💰 ИИ электрик дал ${voltBonus} вольт вместо ненужного предмета!`,
          messageTime: Date.now()
        }
      });
      return;
    }
    
    // Получаем характеристики предмета из магазина
    const shopItems = state.getShopItems();
    const itemStats = shopItems.find(item => item.type === typedType && item.level === level);
    
    if (!itemStats) {
      console.error('Item stats not found for:', type, level);
      return;
    }
    
    // Даем предмет игроку
    set({
      player: {
        ...state.player,
        protection: {
          ...state.player.protection,
          [typedType]: {
            level: itemStats.level,
            protection: itemStats.protection,
            durability: itemStats.durability,
            maxDurability: itemStats.durability
          }
        }
      },
      aiElectrician: {
        ...state.aiElectrician,
        lastMessage: message,
        messageTime: Date.now()
      }
    });
    
    console.log(`Dropped item: ${itemStats.name} (${itemStats.protection}% protection) at fatigue level ${fatigueLevel}`);
    
    // Даем бонусный опыт за находку (больше за лучшие предметы)
    const expBonus = 25 * level;
    get().addExperience(expBonus);
  },

  // Перезапуск ИИ электрика если он был отключен
  restartAIElectrician: () => {
    const state = get();
    if (!state.gameState.isPlaying) {
      console.log('restartAIElectrician: Game not playing');
      return;
    }
    
    if (state.aiElectrician.isActive) {
      console.log('restartAIElectrician: AI already active');
      return;
    }
    
    console.log('restartAIElectrician: Restarting AI Electrician');
    
    // Восстанавливаем энергию и частично чиним оборудование
    set({
      aiElectrician: {
        ...state.aiElectrician,
        energy: Math.max(50, state.aiElectrician.energy), // Минимум 50 энергии
        equipment: {
          battery: Math.max(50, state.aiElectrician.equipment.battery),
          capacitor: Math.max(50, state.aiElectrician.equipment.capacitor), 
          wires: Math.max(50, state.aiElectrician.equipment.wires),
          generator: Math.max(50, state.aiElectrician.equipment.generator)
        },
        lastMessage: 'Отдохнул, снова готов к работе!',
        messageTime: Date.now()
      }
    });
    
    // Запускаем ИИ
    get().startAIElectrician();
  },

  stopAIElectrician: () => {
    set(state => ({
      singleMode: {
        ...state.singleMode,
        aiElectricianActive: false,
        nextDischargeTime: 0,
        dischargeWarningTime: 0,
        isDischarging: false
      },
      aiElectrician: {
        ...state.aiElectrician,
        isActive: false,
        lastMessage: 'Смена закончена, иду домой!',
        messageTime: Date.now()
      }
    }));
  },

  scheduleNextDischarge: () => {
    const state = get();
    console.log('scheduleNextDischarge: Starting, AI active:', state.singleMode.aiElectricianActive);
    if (!state.singleMode.aiElectricianActive) return;

    const now = Date.now();
    
    // Рассчитываем интервал до следующего разряда на основе сложности и AI паттерна
    const getDischargeInterval = () => {
      const baseInterval = {
        easy: { min: 3000, max: 8000 },     // 3-8 секунд - уменьшено для большей частоты
        medium: { min: 2500, max: 6000 },   // 2.5-6 секунд  
        hard: { min: 2000, max: 4000 },     // 2-4 секунды
        extreme: { min: 1500, max: 3000 }   // 1.5-3 секунды
      }[state.singleMode.difficulty];

      // Модификация на основе AI паттерна
      let modifier = 1.0;
      if (state.singleMode.aiPattern === 'burst') modifier = 0.7;      // Чаще
      else if (state.singleMode.aiPattern === 'random') modifier = Math.random() * 0.8 + 0.6; // 0.6-1.4
      else if (state.singleMode.aiPattern === 'adaptive') {
        // Адаптируется к успехам игрока
        const luckCoeff = state.player.luckCoefficient;
        modifier = luckCoeff > 70 ? 0.8 : luckCoeff < 30 ? 1.3 : 1.0;
      }

      const min = baseInterval.min * modifier;
      const max = baseInterval.max * modifier;
      return Math.random() * (max - min) + min;
    };

    const interval = getDischargeInterval();
    const nextDischargeTime = now + interval;
    const dischargeWarningTime = nextDischargeTime - 3000; // Предупреждение за 3 секунды

    console.log('scheduleNextDischarge: Scheduled discharge', {
      interval: interval / 1000 + 's',
      nextDischargeTime,
      dischargeWarningTime,
      timeFromNow: (nextDischargeTime - now) / 1000 + 's'
    });

    set({
      singleMode: {
        ...state.singleMode,
        nextDischargeTime,
        dischargeWarningTime
      }
    });

    // Планируем следующую проверку
    setTimeout(() => {
      console.log('scheduleNextDischarge: Timer triggered, checking discharge');
      get().checkForDischarge();
    }, interval);
  },

  checkForDischarge: () => {
    const state = get();
    if (!state.singleMode.aiElectricianActive || !state.gameState.isPlaying) {
      console.log('checkForDischarge: AI inactive or game not playing', { 
        aiActive: state.singleMode.aiElectricianActive, 
        isPlaying: state.gameState.isPlaying 
      });
      return;
    }

    const now = Date.now();
    console.log('checkForDischarge: Checking discharge timing', {
      now,
      nextDischargeTime: state.singleMode.nextDischargeTime,
      timeUntilDischarge: state.singleMode.nextDischargeTime - now,
      isDischarging: state.singleMode.isDischarging,
      warningSignsActive: state.singleMode.warningSignsActive,
      dischargeWarningTime: state.singleMode.dischargeWarningTime
    });

    // Проверяем, не пора ли показать предупреждение
    if (!state.singleMode.warningSignsActive && now >= state.singleMode.dischargeWarningTime) {
      console.log('checkForDischarge: Activating warning signs');
      set({
        singleMode: {
          ...state.singleMode,
          warningSignsActive: true,
          dangerLevel: 85 // Высокий уровень опасности
        }
      });
    }

    // Проверяем, не пора ли начать разряд
    if (now >= state.singleMode.nextDischargeTime && !state.singleMode.isDischarging) {
      console.log('checkForDischarge: STARTING DISCHARGE!');
      // Начинаем разряд
      set({
        singleMode: {
          ...state.singleMode,
          isDischarging: true
        },
        showElectricSparks: true,
        sparksIntensity: 'high'
      });

      // Увеличиваем счетчик успешных разрядов ИИ электрика
      set({
        aiElectrician: {
          ...state.aiElectrician,
          successfulDischarges: state.aiElectrician.successfulDischarges + 1,
          lastMessage: 'Отличный разряд! Все по плану!',
          messageTime: now
        }
      });

      // Случайный урон оборудованию от разряда
      if (Math.random() < 0.3) { // 30% шанс урона
        get().damageAIElectrician('equipment', Math.random() * 5 + 2);
      }

      // Завершаем разряд через dischargeDuration
      setTimeout(() => {
        console.log('checkForDischarge: ENDING DISCHARGE after', state.singleMode.dischargeDuration, 'ms');
        const currentState = get();
        set({
          singleMode: {
            ...currentState.singleMode,
            isDischarging: false,
            warningSignsActive: false,
            dangerLevel: 0
          },
          showElectricSparks: false
        });

        // Обновляем состояние ИИ электрика
        get().updateAIElectrician();

        // Планируем следующий разряд с учетом состояния ИИ
        if (get().aiElectrician.canWork) {
          console.log('checkForDischarge: Scheduling next discharge after ending current one');
          get().scheduleNextDischarge();
        } else {
          // ИИ электрик устал или сломался, но НЕ отключается полностью
          console.log('checkForDischarge: AI electrician is tired/broken, scheduling with delay');
          set({
            aiElectrician: {
              ...get().aiElectrician,
              lastMessage: get().getAIElectricianMessage(),
              messageTime: Date.now()
            }
          });
          
          // Планируем следующий разряд с большой задержкой (30 секунд)
          setTimeout(() => {
            if (get().singleMode.aiElectricianActive && get().gameState.isPlaying) {
              console.log('checkForDischarge: Tired AI attempting to work again');
              get().scheduleNextDischarge();
            }
          }, 30000);
        }
      }, state.singleMode.dischargeDuration);
    }
  },

  // AI Electrician management methods
  updateAIElectrician: () => {
    const state = get();
    if (!state.aiElectrician.isActive) {
      console.log('updateAIElectrician: AI not active, skipping');
      return;
    }

    const ai = state.aiElectrician;
    const now = Date.now();

    console.log('updateAIElectrician: Current state', {
      energy: ai.energy.toFixed(1),
      voltage: ai.voltage.toFixed(1),
      efficiency: ai.workingEfficiency.toFixed(1),
      mood: ai.mood,
      canWork: ai.canWork
    });

    // Постепенное снижение энергии во время работы
    const energyDrain = ai.workingEfficiency > 80 ? 0.1 : 0.2;
    let newEnergy = Math.max(0, ai.energy - energyDrain);
    
    // Система усталости - увеличивается когда энергия низкая
    let newFatigueLevel = ai.fatigueLevel;
    const wasEnergyLow = ai.energy > 10;
    const isEnergyLow = newEnergy <= 10;
    
    // Увеличиваем усталость когда энергия опускается ниже 10
    if (isEnergyLow && wasEnergyLow) {
      newFatigueLevel = Math.min(10, ai.fatigueLevel + 0.1);
    }
    
    // Постепенное восстановление энергии если она очень низкая (автоматический отдых)
    if (isEnergyLow) {
      newEnergy = Math.min(ai.maxEnergy, newEnergy + 0.5); // Медленное восстановление
      console.log('updateAIElectrician: AI resting, energy recovery:', newEnergy.toFixed(1));
      
      // Проверяем переход на новый уровень усталости и дроп предметов
      if (Math.floor(newFatigueLevel) > Math.floor(ai.fatigueLevel) && Math.random() < 0.5) {
        console.log(`AI fatigue level increased to ${Math.floor(newFatigueLevel)}, dropping item`);
        get().dropElectricianItem();
      }
    } else if (newEnergy > 50) {
      // Снижаем усталость когда энергия восстанавливается
      newFatigueLevel = Math.max(0, ai.fatigueLevel - 0.05);
    }

    // Накопление напряжения для атак
    const voltageGain = ai.voltageChargeRate * (ai.workingEfficiency / 100);
    const newVoltage = Math.min(ai.maxVoltage, ai.voltage + voltageGain);

    // Износ оборудования
    const equipmentWear = Math.random() * 0.05; // 0-5% износа
    const newEquipment = {
      battery: Math.max(0, ai.equipment.battery - equipmentWear),
      capacitor: Math.max(0, ai.equipment.capacitor - equipmentWear * 0.5),
      wires: Math.max(0, ai.equipment.wires - equipmentWear * 0.3),
      generator: Math.max(0, ai.equipment.generator - equipmentWear * 0.7)
    };
    
    // Расчет среднего состояния оборудования
    const avgEquipment = (newEquipment.battery + newEquipment.capacitor + 
                          newEquipment.wires + newEquipment.generator) / 4;
    
    // Автоматическое самовосстановление оборудования (медленно)
    if (avgEquipment < 30) {
      const selfRepair = 0.1; // Очень медленное самовосстановление
      newEquipment.battery = Math.min(100, newEquipment.battery + selfRepair);
      newEquipment.capacitor = Math.min(100, newEquipment.capacitor + selfRepair);
      newEquipment.wires = Math.min(100, newEquipment.wires + selfRepair);
      newEquipment.generator = Math.min(100, newEquipment.generator + selfRepair);
      console.log('updateAIElectrician: Equipment self-repair activated');
    }

    // Расчет эффективности работы
    const newEfficiency = Math.min(100, (newEnergy * 0.7) + (avgEquipment * 0.3));

    // Определение настроения
    let newMood = ai.mood;
    if (newEfficiency < 20) newMood = 'broken';
    else if (newEfficiency < 40) newMood = 'tired';
    else if (ai.failuresCount > ai.successfulDischarges) newMood = 'frustrated';
    else if (ai.playerAttacksReceived > 3) newMood = 'angry'; // Злится от атак игрока
    else if (newEfficiency > 80) newMood = 'confident';

    // Может ли работать
    const canWork = newEnergy > 10 && avgEquipment > 15;

    // Проверяем, нужно ли атаковать игрока
    const shouldAttackPlayer = newVoltage >= 100 && // Достаточно напряжения
                              (ai.playerAttacksReceived > 2 || // Много атак от игрока
                               newMood === 'angry' || // Злое настроение
                               Math.random() < 0.05); // 5% случайная вероятность

    if (shouldAttackPlayer && now - ai.lastAttackTime > 30000) { // Минимум 30 секунд между атаками
      setTimeout(() => {
        get().aiElectricianAttackPlayer();
      }, Math.random() * 5000); // Атака через 0-5 секунд
    }

    set({
      aiElectrician: {
        ...ai,
        energy: newEnergy,
        voltage: newVoltage,
        equipment: newEquipment,
        workingEfficiency: newEfficiency,
        mood: newMood,
        canWork,
        fatigueLevel: newFatigueLevel
      }
    });
  },

  damageAIElectrician: (damageType: 'energy' | 'equipment', amount = 10, isPlayerAttack = false) => {
    const state = get();
    const ai = state.aiElectrician;

    if (damageType === 'energy') {
      const newEnergy = Math.max(0, ai.energy - amount);
      
      let message: string;
      if (isPlayerAttack) {
        // Смешные сообщения когда игрок атакует
        const playerAttackMessages = [
          'Ой! Да ты что, обалдел?! 😱',
          'Эй, это больно! Мы же команда! 😭',
          'Предательство! А я думал мы друзья... 💔',
          'Ауууу! За что меня?! 😵',
          'Ну и зачем ты меня шарахнул?! ⚡',
          'Больно же! Я ведь стараюсь для тебя! 😢',
          'Мама дорогая! Меня ударило током! 🤕',
          'Это что, месть за разряды?! 😤',
          'Ладно-ладно, я понял намек... 😅',
          'Ай-ай-ай! Теперь у меня всё болит! 🤒',
          'Обидно! Я же честно работаю! 😭',
          'Ты серьезно?! Я же электрик, а не мишень! 🎯',
          'Больше так не делай, договорились? 🥺',
          'Кто научил тебя так драться?! 😰',
          'Ну вот, теперь у меня мигрень... 🤕',
          'Так, теперь я разозлился! Готовься к ответке! 😠',
          'Больно! Но ничего, я тебе это припомню... 😈'
        ];
        message = playerAttackMessages[Math.floor(Math.random() * playerAttackMessages.length)];
      } else {
        message = newEnergy <= 0 ? 'Энергия кончилась! Нужен отдых...' : 'Ауч! Меня ударило током!';
      }
      
      set({
        aiElectrician: {
          ...ai,
          energy: newEnergy,
          failuresCount: ai.failuresCount + 1,
          playerAttacksReceived: isPlayerAttack ? ai.playerAttacksReceived + 1 : ai.playerAttacksReceived,
          lastMessage: message,
          messageTime: Date.now()
        }
      });
    } else {
      // Повреждение случайного оборудования
      const equipmentTypes = ['battery', 'capacitor', 'wires', 'generator'] as const;
      const randomEquipment = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
      
      const newEquipment = {
        ...ai.equipment,
        [randomEquipment]: Math.max(0, ai.equipment[randomEquipment] - amount)
      };

      let message: string;
      if (isPlayerAttack) {
        // Смешные сообщения о поломке оборудования от игрока
        const equipmentDamageMessages = [
          `Ты сломал мой ${randomEquipment === 'battery' ? 'аккумулятор' : 
                          randomEquipment === 'capacitor' ? 'конденсатор' :
                          randomEquipment === 'wires' ? 'провода' : 'генератор'}! Теперь что делать?! 😱`,
          `Поломка! Мой ${randomEquipment === 'battery' ? 'аккумулятор' : 
                          randomEquipment === 'capacitor' ? 'конденсатор' :
                          randomEquipment === 'wires' ? 'провода' : 'генератор'} дымится! 💨`,
          `О нет! Без ${randomEquipment === 'battery' ? 'аккумулятора' : 
                        randomEquipment === 'capacitor' ? 'конденсатора' :
                        randomEquipment === 'wires' ? 'проводов' : 'генератора'} я не смогу работать! 😭`,
          `Ты же понимаешь, что ${randomEquipment === 'battery' ? 'аккумулятор' : 
                                  randomEquipment === 'capacitor' ? 'конденсатор' :
                                  randomEquipment === 'wires' ? 'провода' : 'генератор'} стоит денег?! 💸`,
          'Вот это ты меня достал! Теперь ремонтировать придется... 🔧'
        ];
        message = equipmentDamageMessages[Math.floor(Math.random() * equipmentDamageMessages.length)];
      } else {
        message = `Сломался ${randomEquipment === 'battery' ? 'аккумулятор' : 
                               randomEquipment === 'capacitor' ? 'конденсатор' :
                               randomEquipment === 'wires' ? 'провода' : 'генератор'}!`;
      }

      set({
        aiElectrician: {
          ...ai,
          equipment: newEquipment,
          failuresCount: ai.failuresCount + 1,
          lastMessage: message,
          messageTime: Date.now()
        }
      });
    }

    // Обновляем состояние
    get().updateAIElectrician();
  },

  repairAIElectrician: (repairType: 'energy' | 'equipment') => {
    const state = get();
    const ai = state.aiElectrician;

    if (repairType === 'energy') {
      const newEnergy = Math.min(ai.maxEnergy, ai.energy + 25);
      const repairMessages = [
        'Спасибо! Чувствую прилив сил!',
        'Отлично! Теперь я могу работать дольше!',
        'Энергия восстановлена! Готов к работе!',
        'Вау! Как будто заново родился!'
      ];
      set({
        aiElectrician: {
          ...ai,
          energy: newEnergy,
          lastMessage: repairMessages[Math.floor(Math.random() * repairMessages.length)],
          messageTime: Date.now()
        }
      });
    } else {
      // Восстанавливаем все оборудование на 20%
      const newEquipment = {
        battery: Math.min(100, ai.equipment.battery + 20),
        capacitor: Math.min(100, ai.equipment.capacitor + 20),
        wires: Math.min(100, ai.equipment.wires + 20),
        generator: Math.min(100, ai.equipment.generator + 20)
      };

      const repairMessages = [
        'Отремонтировал оборудование, теперь работает лучше!',
        'Техника как новая! Спасибо за помощь!',
        'Все детали заменены, можно продолжать!',
        'Оборудование восстановлено! Теперь все будет работать!'
      ];

      set({
        aiElectrician: {
          ...ai,
          equipment: newEquipment,
          lastMessage: repairMessages[Math.floor(Math.random() * repairMessages.length)],
          messageTime: Date.now()
        }
      });
    }

    get().updateAIElectrician();
  },

  aiElectricianAttackPlayer: () => {
    const state = get();
    const ai = state.aiElectrician;
    
    if (!ai.isActive || ai.voltage < 100) return;

    console.log('AI Electrician attacking player!', {
      aiVoltage: ai.voltage,
      playerVolts: state.player.volts
    });

    // Рассчитываем урон от атаки ИИ
    const baseDamage = 20;
    const voltageDamage = Math.floor(ai.voltage / 20); // 1 урон за каждые 20 вольт
    const totalDamage = baseDamage + voltageDamage;
    
    // Сообщения для атаки
    const attackMessages = [
      `Получай! ${ai.voltage} вольт прямо в тебя! ⚡😈`,
      `А вот и ответка за твои выходки! ${ai.voltage}В! 💀`,
      `Думал я не отвечу? Вот тебе ${ai.voltage} вольт! ⚡😤`,
      `Месть электрика! ${ai.voltage} вольт возмездия! ⚡👿`,
      `Получи разряд в ${ai.voltage}В! Это тебе урок! 😠⚡`,
      `Вот что бывает с теми, кто нападает на электрика! ${ai.voltage}В! 💥`,
      `Ответный удар! ${ai.voltage} вольт прямо в цель! ⚡🎯`,
      `Хватит меня трогать! Держи ${ai.voltage} вольт! 😡⚡`,
    ];

    // ВАЖНО: Устанавливаем флаг разряда для корректной работы TigerOutlet
    set({
      singleMode: {
        ...state.singleMode,
        isDischarging: true,
        warningSignsActive: true,
        dangerLevel: 100
      }
    });

    // Обновляем состояние ИИ
    set({
      aiElectrician: {
        ...ai,
        voltage: 0, // Обнуляем напряжение после атаки
        lastAttackTime: Date.now(),
        lastMessage: attackMessages[Math.floor(Math.random() * attackMessages.length)],
        messageTime: Date.now(),
        playerAttacksReceived: Math.max(0, ai.playerAttacksReceived - 1) // Уменьшаем счетчик атак
      }
    });

    // Наносим урон игроку (отнимаем вольты)
    const newPlayerVolts = Math.max(0, state.player.volts - totalDamage);
    
    set({
      player: {
        ...state.player,
        volts: newPlayerVolts
      }
    });

    // Эффекты атаки
    set({
      showElectricSparks: true,
      sparksIntensity: 'extreme'
    });

    // Завершаем разряд через 3 секунды
    setTimeout(() => {
      set({
        showElectricSparks: false,
        singleMode: {
          ...get().singleMode,
          isDischarging: false,
          warningSignsActive: false,
          dangerLevel: 0
        }
      });
      
      // ВАЖНО: Перезапускаем планирование обычных разрядов после атаки ИИ
      if (get().singleMode.aiElectricianActive && get().gameState.isPlaying) {
        console.log('AI attack complete, restarting discharge scheduling');
        get().scheduleNextDischarge();
      }
    }, 3000);
  },

  getAIElectricianMessage: () => {
    const state = get();
    const ai = state.aiElectrician;

    const messages = {
      confident: [
        'Я лучший электрик в городе!',
        'Эта работа мне по плечу!',
        'Никто не справится лучше меня!',
        'У меня золотые руки!',
        'Электричество - моя стихия!',
        'Я знаю все о токе и напряжении!',
        'Розетки трепещут от моего мастерства!'
      ],
      frustrated: [
        'Что-то сегодня не мой день...',
        'Техника подводит, как всегда...',
        'Может быть, стоит сменить профессию?',
        'Опять что-то пошло не так!',
        'Почему ничего не работает как надо?',
        'Кто вообще проектировал эту схему?!',
        'Каждый день одни проблемы...'
      ],
      tired: [
        'Устал я уже...',
        'Нужен перерыв на кофе',
        'Сил больше нет работать',
        'Хочется домой...',
        'Рабочий день слишком длинный',
        'Глаза уже слипаются',
        'Может, хватит на сегодня?'
      ],
      broken: [
        'Все сломалось! Ничего не работает!',
        'Это конец! Я больше не могу!',
        'Вызывайте другого электрика...',
        'Техника в хлам, а я без сил!',
        'Аварийное отключение! Все пропало!',
        'Системный сбой! Помогите!',
        'Я сломался как старая лампочка!'
      ],
      angry: [
        'Да что ж такое?! Опять сбой!',
        'Кто проектировал эту схему?!',
        'Руки бы поотрывать создателям!',
        'Нервы уже на пределе!',
        'Сколько можно терпеть эту ерунду?!',
        'Где мой молоток?! Сейчас все исправлю!',
        'Противная техника! Ненавижу!',
        'Лучше бы пошел в программисты!'
      ]
    };

    const moodMessages = messages[ai.mood] || messages.confident;
    return moodMessages[Math.floor(Math.random() * moodMessages.length)];
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
  },

  // Protection shop functions
  buyProtectionItem: (type: keyof PlayerProtection, level: number) => {
    const shopItems = get().getShopItems();
    const item = shopItems.find(item => item.type === type && item.level === level);
    if (!item) return false;

    const currentPlayer = get().player;
    if (currentPlayer.volts < item.price) return false;

    set((state) => ({
      player: {
        ...state.player,
        volts: state.player.volts - item.price,
        protection: {
          ...state.player.protection,
          [type]: {
            level: item.level,
            protection: item.protection,
            durability: item.durability,
            maxDurability: item.durability
          }
        }
      }
    }));

    return true;
  },

  getShopItems: (): ShopItem[] => {
    return [
      // Перчатки
      { id: 'gloves-1', type: 'gloves', level: 1, protection: 10, price: 50, durability: 100, name: 'Резиновые перчатки', description: 'Базовая защита от небольших разрядов', icon: '🧤' },
      { id: 'gloves-2', type: 'gloves', level: 2, protection: 20, price: 150, durability: 200, name: 'Усиленные перчатки', description: 'Улучшенная изоляция для средних разрядов', icon: '🧤' },
      { id: 'gloves-3', type: 'gloves', level: 3, protection: 35, price: 400, durability: 300, name: 'Диэлектрические перчатки', description: 'Профессиональная защита от высокого напряжения', icon: '🧤' },
      
      // Сапоги
      { id: 'boots-1', type: 'boots', level: 1, protection: 15, price: 80, durability: 150, name: 'Резиновые сапоги', description: 'Защита ног от заземления', icon: '👢' },
      { id: 'boots-2', type: 'boots', level: 2, protection: 25, price: 200, durability: 250, name: 'Диэлектрические сапоги', description: 'Улучшенная изоляция от земли', icon: '👢' },
      { id: 'boots-3', type: 'boots', level: 3, protection: 40, price: 500, durability: 350, name: 'Профессиональные сапоги', description: 'Максимальная защита от заземления', icon: '👢' },
      
      // Костюм
      { id: 'suit-1', type: 'suit', level: 1, protection: 20, price: 200, durability: 120, name: 'Изолирующий костюм', description: 'Защита тела от электрических разрядов', icon: '🥽' },
      { id: 'suit-2', type: 'suit', level: 2, protection: 35, price: 500, durability: 200, name: 'Защитный костюм', description: 'Усиленная защита всего тела', icon: '🥽' },
      { id: 'suit-3', type: 'suit', level: 3, protection: 50, price: 1000, durability: 300, name: 'Профессиональный костюм', description: 'Максимальная защита для электриков', icon: '🥽' },
      
      // Шлем
      { id: 'helmet-1', type: 'helmet', level: 1, protection: 10, price: 100, durability: 200, name: 'Защитная каска', description: 'Защита головы от ударов током', icon: '⛑️' },
      { id: 'helmet-2', type: 'helmet', level: 2, protection: 20, price: 300, durability: 300, name: 'Диэлектрическая каска', description: 'Улучшенная защита головы', icon: '⛑️' },
      { id: 'helmet-3', type: 'helmet', level: 3, protection: 30, price: 600, durability: 400, name: 'Профессиональная каска', description: 'Максимальная защита головы', icon: '⛑️' }
    ];
  },

  getTotalProtection: (): number => {
    const protection = get().player.protection;
    let total = 0;
    
    Object.values(protection).forEach(item => {
      if (item.durability > 0) {
        // Защита снижается при износе
        const durabilityRatio = item.durability / item.maxDurability;
        total += item.protection * durabilityRatio;
      }
    });
    
    return Math.min(total, 80); // Максимум 80% защиты
  },

  damageProtection: (damage: number) => {
    set((state) => {
      const newProtection = { ...state.player.protection };
      
      // Случайно повреждаем защиту при ударе тока
      Object.keys(newProtection).forEach(key => {
        const item = newProtection[key as keyof PlayerProtection];
        if (item.durability > 0 && Math.random() < 0.3) { // 30% шанс повреждения
          item.durability = Math.max(0, item.durability - Math.floor(damage / 4));
        }
      });
      
      return {
        player: {
          ...state.player,
          protection: newProtection
        }
      };
    });
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

// Дополнительные методы, внедряемые в стор через mutate
// Примечание: для простоты добавляем их на прототип стора через set после создания
// удалено: attachStageAndPointsHandlers IIFE; функционал встроен в стор напрямую
