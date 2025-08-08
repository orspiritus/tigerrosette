import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../utils/soundManager';
import { hapticManager } from '../utils/hapticManager';

interface CounterAttackButtonProps {
  className?: string;
  disabled?: boolean;
}

export const CounterAttackButton: React.FC<CounterAttackButtonProps> = ({ 
  className = '', 
  disabled = false 
}) => {
  const { 
    player, 
    singleMode, 
    aiElectrician,
    damageAIElectrician,
    gameState 
  } = useGameStore();
  
  const [isAttacking, setIsAttacking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showEffect, setShowEffect] = useState(false);

  // Минимальное напряжение для атаки
  const minVoltageForAttack = 10; // Снижено с 50 до 10

  // Проверяем, можно ли атаковать
  const canAttack = gameState.isPlaying && 
                   singleMode.aiElectricianActive && 
                   aiElectrician.isActive &&
                   !disabled && 
                   cooldown === 0 &&
                   player.volts >= minVoltageForAttack;

  const handleCounterAttack = async () => {
    if (!canAttack || isAttacking) return;

    setIsAttacking(true);
    setShowEffect(true);

    // Звуки и вибрация атаки
    hapticManager.electricShock();
    soundManager.generateShockSound();
    
    // Наносим урон ИИ электрику на основе напряжения игрока
    const currentVoltage = player.volts;
    const baseDamage = 10;
    const voltageDamage = Math.floor(currentVoltage / 10); // 1 урон за каждые 10 вольт
    const totalDamage = baseDamage + voltageDamage;
    
    console.log('Counter attack!', {
      playerVoltage: currentVoltage,
      baseDamage,
      voltageDamage,
      totalDamage
    });
    
    damageAIElectrician('energy', totalDamage, true);
    
    // Иногда повреждаем оборудование при сильной атаке
    if (currentVoltage >= 200) {
      damageAIElectrician('equipment', Math.random() * 15 + 10, true);
    } else if (currentVoltage >= 100) {
      if (Math.random() < 0.5) {
        damageAIElectrician('equipment', Math.random() * 10 + 5, true);
      }
    }

    // ОБНУЛЯЕМ напряжение игрока после атаки
    const state = useGameStore.getState();
    useGameStore.setState({
      player: {
        ...state.player,
        volts: 0 // Полностью обнуляем напряжение
      }
    });

    // Устанавливаем кулдаун на основе мощности атаки
    const cooldownTime = Math.max(3, Math.min(15, Math.floor(currentVoltage / 50))); // От 3 до 15 секунд
    setCooldown(cooldownTime);
    const cooldownInterval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Убираем эффект через 1 секунду
    setTimeout(() => {
      setShowEffect(false);
      setIsAttacking(false);
    }, 1000);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Эффект контратаки */}
      <AnimatePresence>
        {showEffect && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.5, 1], 
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="w-full h-full bg-yellow-400 rounded-full shadow-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основная кнопка */}
      <motion.button
        onClick={handleCounterAttack}
        disabled={!canAttack || isAttacking}
        className={`
          relative w-16 h-16 rounded-full border-2 transition-all duration-200
          ${canAttack 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-lg hover:shadow-xl cursor-pointer' 
            : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
          }
          ${cooldown > 0 ? 'animate-pulse' : ''}
        `}
        whileTap={canAttack ? { scale: 0.9 } : {}}
        whileHover={canAttack ? { scale: 1.1, rotate: 5 } : {}}
        style={{
          boxShadow: canAttack 
            ? `0 0 20px rgba(255, 193, 7, 0.6)` 
            : 'none'
        }}
      >
        {/* Иконка */}
        <div className="flex items-center justify-center w-full h-full">
          {cooldown > 0 ? (
            <span className="text-white font-bold text-sm">{cooldown}</span>
          ) : (
            <span className="text-2xl">
              {isAttacking ? '💥' : player.level >= 5 ? '⚡' : '🦷'}
            </span>
          )}
        </div>

        {/* Индикатор напряжения */}
        {canAttack && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/80 text-white text-xs px-1 py-0.5 rounded">
              {player.volts}⚡ → 0⚡
            </div>
          </div>
        )}
      </motion.button>

      {/* Тултип */}
      {!canAttack && !isAttacking && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {player.volts < minVoltageForAttack 
              ? `Нужно ${minVoltageForAttack - player.volts} вольт` 
              : !gameState.isPlaying 
              ? 'Игра не запущена'
              : !singleMode.aiElectricianActive
              ? 'ИИ электрик неактивен'
              : 'Контратака недоступна'
            }
          </div>
        </div>
      )}
    </div>
  );
};
