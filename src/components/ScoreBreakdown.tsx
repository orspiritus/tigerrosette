import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

interface ScoreBreakdownProps {
  onClose: () => void;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ onClose }) => {
  const { player, singleMode, gameState } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="glass-effect p-6 max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold text-center mb-6 text-primary-orange">
          📊 Система очков и уровней
        </h3>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center glass-effect p-3 rounded-lg">
            <div className="text-xs text-gray-400">ТЕКУЩАЯ СЕРИЯ</div>
            <div className="text-xl font-bold text-yellow-400">
              {singleMode.streakCount}
            </div>
          </div>
          <div className="text-center glass-effect p-3 rounded-lg">
            <div className="text-xs text-gray-400">КОЭФФИЦИЕНТ УДАЧИ</div>
            <div className={`text-xl font-bold ${
              player.luckCoefficient >= 70 ? 'text-green-400' :
              player.luckCoefficient >= 50 ? 'text-yellow-400' :
              player.luckCoefficient >= 30 ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {player.luckCoefficient}%
            </div>
          </div>
          <div className="text-center glass-effect p-3 rounded-lg">
            <div className="text-xs text-gray-400">ТЕКУЩИЙ СЧЕТ</div>
            <div className="text-xl font-bold text-green-400">
              {gameState.score}⚡
            </div>
          </div>
          <div className="text-center glass-effect p-3 rounded-lg">
            <div className="text-xs text-gray-400">ВСЕГО ВОЛЬТ</div>
            <div className="text-xl font-bold text-blue-400">
              {player.volts}⚡
            </div>
          </div>
        </div>

        {/* Luck Statistics */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-accent-blue mb-3">🍀 Статистика удачи</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-effect p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">УСПЕШНЫХ</div>
              <div className="text-lg font-bold text-green-400">{player.successfulClicks}</div>
            </div>
            <div className="glass-effect p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">УДАРОВ ТОКОМ</div>
              <div className="text-lg font-bold text-red-400">{player.shockedClicks}</div>
            </div>
            <div className="glass-effect p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">ВСЕГО КЛИКОВ</div>
              <div className="text-lg font-bold text-blue-400">{player.totalClicks}</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm text-gray-300">
              💡 Удача рассчитывается как процент успешных нажатий
            </div>
          </div>
        </div>

        {/* Scoring Rules */}
        <div className="space-y-6">
          {/* Experience System */}
          <div>
            <h4 className="text-lg font-bold text-accent-blue mb-3">📈 Система опыта и уровней</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-green-400 font-bold">🟢 Безопасное нажатие:</div>
                <div className="text-sm text-gray-300">+10 опыта</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-yellow-400 font-bold">🟡 Рискованное (2x+):</div>
                <div className="text-sm text-gray-300">+15 опыта</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-red-400 font-bold">🔴 Экстремальное (3x+):</div>
                <div className="text-sm text-gray-300">+25 опыта</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-orange-400 font-bold">💥 Поражение током:</div>
                <div className="text-sm text-gray-300">+5 опыта</div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-sm text-yellow-400 font-semibold">
                🏆 За повышение уровня вы получаете бонусные вольты!
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Уровень 2: +50⚡ • Уровень 5: +150⚡ • Уровень 10: +500⚡
              </div>
              <div className="text-xs text-blue-300 mt-2">
                🎨 Изображение розетки меняется каждые 5 уровней!
              </div>
            </div>
          </div>

          {/* Basic Points Table */}
          <div>
            <h4 className="text-lg font-bold text-accent-blue mb-3">⚡ Базовые очки за нажатие</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-green-400 font-bold">🟢 Безопасное нажатие:</div>
                <div className="text-sm text-gray-300">+10⚡ (базовые очки)</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-red-400 font-bold">💥 Поражение током:</div>
                <div className="text-sm text-gray-300">-8⚡ до -25⚡ (случайно)</div>
              </div>
            </div>
          </div>

          {/* Risk Multipliers */}
          <div>
            <h4 className="text-lg font-bold text-accent-blue mb-3">🎯 Множители за риск</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-green-400 font-bold">🟢 Лёгкий (15% риск):</div>
                <div className="text-sm text-gray-300">×1.0 (базовые очки)</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-yellow-400 font-bold">🟡 Средний (25% риск):</div>
                <div className="text-sm text-gray-300">×1.5 множитель</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-orange-400 font-bold">🟠 Сложный (35% риск):</div>
                <div className="text-sm text-gray-300">×2.0 множитель</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-red-400 font-bold">🔴 Экстрим (50% риск):</div>
                <div className="text-sm text-gray-300">×3.0 множитель</div>
              </div>
            </div>
          </div>

          {/* Streak Bonuses */}
          <div>
            <h4 className="text-lg font-bold text-accent-blue mb-3">🔥 Бонусы за серии</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-gray-400 font-bold">0-4 нажатий:</div>
                <div className="text-sm text-gray-300">×1.0 (без бонуса)</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-yellow-400 font-bold">5+ нажатий:</div>
                <div className="text-sm text-gray-300">×1.2 бонус</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-orange-400 font-bold">10+ нажатий:</div>
                <div className="text-sm text-gray-300">×1.5 бонус</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-red-400 font-bold">25+ нажатий:</div>
                <div className="text-sm text-gray-300">×2.0 бонус</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-purple-400 font-bold">50+ нажатий:</div>
                <div className="text-sm text-gray-300">×3.0 бонус</div>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div>
            <h4 className="text-lg font-bold text-accent-blue mb-3">🧮 Формула расчёта</h4>
            <div className="glass-effect p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="text-center text-lg font-mono">
                <span className="text-white">Итоговые очки</span> = 
                <span className="text-green-400"> 10⚡</span> × 
                <span className="text-orange-400"> Риск</span> × 
                <span className="text-yellow-400"> Серия</span>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-lg font-bold text-accent-blue mb-3">💡 Примеры расчётов</h4>
            <div className="space-y-3">
              <div className="bg-black/30 p-3 rounded-lg">
                <div className="text-green-400 font-bold">🟢 Безопасная игра:</div>
                <div className="text-sm text-gray-300">
                  10⚡ × 1.0 (низкий риск) × 1.2 (5+ серия) = <span className="text-white font-bold">12⚡</span>
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg">
                <div className="text-orange-400 font-bold">🟠 Рискованная игра:</div>
                <div className="text-sm text-gray-300">
                  10⚡ × 2.0 (высокий риск) × 1.5 (10+ серия) = <span className="text-white font-bold">30⚡</span>
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg">
                <div className="text-red-400 font-bold">🔴 Экстремальная игра:</div>
                <div className="text-sm text-gray-300">
                  10⚡ × 3.0 (экстрим риск) × 2.0 (25+ серия) = <span className="text-white font-bold">60⚡</span>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg">
                <div className="text-red-400 font-bold">💥 Поражение током:</div>
                <div className="text-sm text-gray-300">
                  Случайно от 8⚡ до 25⚡ + <span className="text-red-400">серия сбрасывается</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          💡 Совет: Балансируйте между риском и безопасностью для максимального заработка!
        </div>
      </motion.div>
    </motion.div>
  );
};
