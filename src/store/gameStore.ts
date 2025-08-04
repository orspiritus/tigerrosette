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
  warningSignsActive: false,
  
  // AI Electrician System
  aiElectricianActive: false,
  nextDischargeTime: 0,
  dischargeWarningTime: 0,
  isDischarging: false,
  dischargeDuration: 2000 // 2 секунды
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
    workingEfficiency: 100,
    canWork: true
  },
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

    // Запускаем ИИ электрика
    setTimeout(() => {
      get().startAIElectrician();
    }, 3000); // Начинаем через 3 секунды после старта игры
  },

  startMultiplayerMode: (mode: 'duel' | 'tournament' | 'coop') => {
    let gameMode: 'multiplayer' | 'duel' = 'multiplayer';
    
    // Если это дуэль, ставим специальный режим
    if (mode === 'duel') {
      gameMode = 'duel';
    }
    
    set({
      gameState: {
        ...get().gameState,
        mode: gameMode,
        isPlaying: true,
        gameTime: 0,
        score: 0
      }
    });
    
    console.log(`Starting multiplayer mode: ${mode}`);
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

  // AI Electrician System
  startAIElectrician: () => {
    const state = get();
    if (!state.gameState.isPlaying) return;

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
    get().scheduleNextDischarge();
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
    if (!state.singleMode.aiElectricianActive) return;

    const now = Date.now();
    
    // Рассчитываем интервал до следующего разряда на основе сложности и AI паттерна
    const getDischargeInterval = () => {
      const baseInterval = {
        easy: { min: 8000, max: 15000 },    // 8-15 секунд
        medium: { min: 6000, max: 12000 },  // 6-12 секунд  
        hard: { min: 4000, max: 9000 },     // 4-9 секунд
        extreme: { min: 3000, max: 7000 }   // 3-7 секунд
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

    set({
      singleMode: {
        ...state.singleMode,
        nextDischargeTime,
        dischargeWarningTime
      }
    });

    // Планируем следующую проверку
    setTimeout(() => {
      get().checkForDischarge();
    }, interval);
  },

  checkForDischarge: () => {
    const state = get();
    if (!state.singleMode.aiElectricianActive || !state.gameState.isPlaying) return;

    const now = Date.now();

    // Проверяем, не пора ли показать предупреждение
    if (!state.singleMode.warningSignsActive && now >= state.singleMode.dischargeWarningTime) {
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

        // Планируем следующий разряд только если ИИ может работать
        if (get().aiElectrician.canWork) {
          get().scheduleNextDischarge();
        } else {
          // ИИ электрик сломался
          set({
            aiElectrician: {
              ...get().aiElectrician,
              lastMessage: get().getAIElectricianMessage(),
              messageTime: Date.now()
            }
          });
          get().stopAIElectrician();
        }
      }, state.singleMode.dischargeDuration);
    }
  },

  // AI Electrician management methods
  updateAIElectrician: () => {
    const state = get();
    if (!state.aiElectrician.isActive) return;

    const ai = state.aiElectrician;

    // Постепенное снижение энергии во время работы
    const energyDrain = ai.workingEfficiency > 80 ? 0.1 : 0.2;
    const newEnergy = Math.max(0, ai.energy - energyDrain);

    // Износ оборудования
    const equipmentWear = Math.random() * 0.05; // 0-5% износа
    const newEquipment = {
      battery: Math.max(0, ai.equipment.battery - equipmentWear),
      capacitor: Math.max(0, ai.equipment.capacitor - equipmentWear * 0.5),
      wires: Math.max(0, ai.equipment.wires - equipmentWear * 0.3),
      generator: Math.max(0, ai.equipment.generator - equipmentWear * 0.7)
    };

    // Расчет эффективности работы
    const avgEquipment = (newEquipment.battery + newEquipment.capacitor + 
                          newEquipment.wires + newEquipment.generator) / 4;
    const newEfficiency = Math.min(100, (newEnergy * 0.7) + (avgEquipment * 0.3));

    // Определение настроения
    let newMood = ai.mood;
    if (newEfficiency < 20) newMood = 'broken';
    else if (newEfficiency < 40) newMood = 'tired';
    else if (ai.failuresCount > ai.successfulDischarges) newMood = 'frustrated';
    else if (newEfficiency > 80) newMood = 'confident';
    else newMood = 'angry';

    // Может ли работать
    const canWork = newEnergy > 10 && avgEquipment > 15;

    set({
      aiElectrician: {
        ...ai,
        energy: newEnergy,
        equipment: newEquipment,
        workingEfficiency: newEfficiency,
        mood: newMood,
        canWork
      }
    });
  },

  damageAIElectrician: (damageType: 'energy' | 'equipment', amount = 10) => {
    const state = get();
    const ai = state.aiElectrician;

    if (damageType === 'energy') {
      const newEnergy = Math.max(0, ai.energy - amount);
      set({
        aiElectrician: {
          ...ai,
          energy: newEnergy,
          failuresCount: ai.failuresCount + 1,
          lastMessage: newEnergy <= 0 ? 'Энергия кончилась! Нужен отдых...' : 'Ауч! Меня ударило током!',
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

      set({
        aiElectrician: {
          ...ai,
          equipment: newEquipment,
          failuresCount: ai.failuresCount + 1,
          lastMessage: `Сломался ${randomEquipment === 'battery' ? 'аккумулятор' : 
                                    randomEquipment === 'capacitor' ? 'конденсатор' :
                                    randomEquipment === 'wires' ? 'провода' : 'генератор'}!`,
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
