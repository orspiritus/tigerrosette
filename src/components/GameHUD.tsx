import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { ConnectionStatus } from './ConnectionStatus';
import { ProtectionShop } from './ProtectionShop';

export const GameHUD: React.FC = () => {
  const { player, gameState, singleMode, aiElectrician, repairAIElectrician, getTotalProtection } = useGameStore();
  const [showShop, setShowShop] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10 pointer-events-auto">
      <div className="flex justify-between items-center p-4">
        {/* Score Display */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">СЧЁТ</div>
            <div className="text-xl font-bold text-accent-lime">
              {gameState.score.toLocaleString()}
            </div>
          </motion.div>
          
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">ВОЛЬТЫ</div>
            <div className="text-xl font-bold text-primary-orange">
              {player.volts.toLocaleString()}⚡
            </div>
          </motion.div>
        </div>

        {/* Streak Counter */}
        <div className="text-center">
          <motion.div 
            className="glass-effect px-4 py-2"
            animate={{ 
              scale: singleMode.streakCount > 0 ? [1, 1.1, 1] : 1,
              boxShadow: singleMode.streakCount >= 5 
                ? '0 0 20px #E8FF00' 
                : '0 0 10px rgba(255,255,255,0.2)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs text-gray-300">СЕРИЯ</div>
            <div className={`text-xl font-bold ${
              singleMode.streakCount >= 25 ? 'text-red-400' :
              singleMode.streakCount >= 10 ? 'text-orange-400' :
              singleMode.streakCount >= 5 ? 'text-yellow-400' :
              'text-white'
            }`}>
              {singleMode.streakCount}
            </div>
          </motion.div>
        </div>

        {/* Difficulty & Stats */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
            animate={{
              opacity: player.luckIndicatorHidden && Date.now() < player.luckHiddenUntil ? 0.3 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs text-gray-300">УДАЧА</div>
            <div className={`text-sm font-bold ${
              player.luckIndicatorHidden && Date.now() < player.luckHiddenUntil ? 
                'text-gray-500' :
                player.luckCoefficient >= 70 ? 'text-green-400' :
                player.luckCoefficient >= 50 ? 'text-yellow-400' :
                player.luckCoefficient >= 30 ? 'text-orange-400' :
                'text-red-400'
            }`}>
              {player.luckIndicatorHidden && Date.now() < player.luckHiddenUntil ? 
                '???' : 
                `${player.luckCoefficient}%`
              }
            </div>
          </motion.div>

          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">СЛОЖНОСТЬ</div>
            <div className={`text-sm font-bold ${
              singleMode.difficulty === 'extreme' ? 'text-red-400' :
              singleMode.difficulty === 'hard' ? 'text-orange-400' :
              singleMode.difficulty === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {singleMode.difficulty === 'extreme' ? 'ЭКСТРИМ' :
               singleMode.difficulty === 'hard' ? 'СЛОЖНЫЙ' :
               singleMode.difficulty === 'medium' ? 'СРЕДНИЙ' : 'ЛЁГКИЙ'}
            </div>
          </motion.div>

          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: singleMode.dangerLevel > 80 ? '0 0 20px #ff4444' :
                        singleMode.dangerLevel > 60 ? '0 0 15px #ff8800' :
                        singleMode.dangerLevel > 40 ? '0 0 10px #ffaa00' :
                        '0 0 5px rgba(255,255,255,0.2)'
            }}
          >
            <div className="text-xs text-gray-300">ОПАСНОСТЬ</div>
            <div className={`text-sm font-bold ${
              singleMode.dangerLevel > 80 ? 'text-red-400' :
              singleMode.dangerLevel > 60 ? 'text-orange-400' :
              singleMode.dangerLevel > 40 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {singleMode.dangerLevel}%
            </div>
          </motion.div>

          {/* AI Electrician Status */}
          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: singleMode.isDischarging ? '0 0 20px #ff0000' :
                        singleMode.warningSignsActive ? '0 0 15px #ff8800' :
                        singleMode.aiElectricianActive ? '0 0 10px #00ffff' :
                        '0 0 5px rgba(255,255,255,0.2)',
              scale: singleMode.isDischarging ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 0.3, repeat: singleMode.isDischarging ? Infinity : 0 }}
          >
            <div className="text-xs text-gray-300">ИИ ЭЛЕКТРИК</div>
            <div className={`text-sm font-bold ${
              singleMode.isDischarging ? 'text-red-400' :
              singleMode.warningSignsActive ? 'text-orange-400' :
              singleMode.aiElectricianActive ? 'text-cyan-400' :
              'text-gray-500'
            }`}>
              {singleMode.isDischarging ? '⚡ РАЗРЯД!' :
               singleMode.warningSignsActive ? '⚠️ ВНИМАНИЕ!' :
               singleMode.aiElectricianActive ? '🤖 АКТИВЕН' :
               '😴 СПИТ'}
            </div>
          </motion.div>

          {/* AI Electrician Energy & Fatigue */}
          {singleMode.aiElectricianActive && (
            <motion.div 
              className="glass-effect px-4 py-2 min-w-[120px]"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: aiElectrician.energy < 20 ? '0 0 15px #ff4444' :
                          aiElectrician.energy < 50 ? '0 0 10px #ff8800' :
                          '0 0 5px rgba(255,255,255,0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-300">ЭТАП</div>
                  <div className="text-sm font-bold text-cyan-300">{singleMode.stage || 1}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-300">ОЧКИ ИИ</div>
                  <div className="text-sm font-bold text-cyan-200">
                    {Math.max(0, Math.floor((aiElectrician.points ?? 0)))} / {Math.max(1, Math.floor((aiElectrician.maxPoints ?? 0)))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-300">ЭНЕРГИЯ</div>
              <div className={`text-sm font-bold ${
                aiElectrician.energy < 20 ? 'text-red-400' :
                aiElectrician.energy < 50 ? 'text-orange-400' :
                'text-green-400'
              }`}>
                {Math.round(aiElectrician.energy)}%
              </div>
              
              {/* Fatigue Level */}
              <div className="text-xs text-gray-300 mt-1">УСТАЛОСТЬ</div>
              <div className={`text-xs font-bold ${
                aiElectrician.fatigueLevel >= 8 ? 'text-red-400' :
                aiElectrician.fatigueLevel >= 5 ? 'text-orange-400' :
                aiElectrician.fatigueLevel >= 2 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {Math.floor(aiElectrician.fatigueLevel)}/10
                {aiElectrician.fatigueLevel >= 8 && ' 💎'}
                {aiElectrician.fatigueLevel >= 5 && aiElectrician.fatigueLevel < 8 && ' 🥇'}
                {aiElectrician.fatigueLevel >= 2 && aiElectrician.fatigueLevel < 5 && ' 🥈'}
              </div>
            </motion.div>
          )}

          <motion.div 
            className="glass-effect px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs text-gray-300">НАЖАТИЙ</div>
            <div className="text-lg font-bold text-accent-blue">
              {player.totalClicks}
            </div>
          </motion.div>

          {/* Connection Status */}
          <ConnectionStatus />
        </div>
      </div>
      
      {/* Warning Banner */}
      {singleMode.warningSignsActive && (
        <motion.div
          className="bg-yellow-500/80 text-black px-4 py-2 text-center font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: [0, 1, 0.7, 1, 0.7, 1], 
            y: 0 
          }}
          transition={{ duration: 0.5 }}
        >
          ⚠️ ОПАСНОСТЬ! ВЫСОКИЙ РИСК РАЗРЯДА! ⚠️
        </motion.div>
      )}

      {/* Danger Level Indicator */}
      {singleMode.dangerLevel > 30 && (
        <motion.div
          className={`px-4 py-1 text-center text-xs font-semibold ${
            singleMode.dangerLevel > 70 ? 'bg-red-500/60 text-white' :
            singleMode.dangerLevel > 50 ? 'bg-orange-500/60 text-white' :
            'bg-yellow-500/60 text-black'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          🔥 УРОВЕНЬ ОПАСНОСТИ: {singleMode.dangerLevel}% 🔥
        </motion.div>
      )}
      
      {/* AI Electrician Detailed Status */}
      {singleMode.aiElectricianActive && (
        <motion.div
          className="bg-black/40 border-t border-white/10 px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* AI Electrician Name and Message */}
              <div className="text-sm">
                <div className="text-cyan-400 font-bold">⚡ {aiElectrician.name}</div>
                <div className={`text-xs ${
                  aiElectrician.mood === 'confident' ? 'text-green-400' :
                  aiElectrician.mood === 'frustrated' ? 'text-orange-400' :
                  aiElectrician.mood === 'tired' ? 'text-yellow-400' :
                  aiElectrician.mood === 'broken' ? 'text-red-400' :
                  'text-red-600'
                }`}>
                  {aiElectrician.lastMessage}
                </div>
              </div>

              {/* Energy Bar */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-300 mb-1">ЭНЕРГИЯ</div>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      aiElectrician.energy > 60 ? 'bg-green-500' :
                      aiElectrician.energy > 30 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${aiElectrician.energy}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-white">{Math.round(aiElectrician.energy)}%</div>
              </div>

              {/* Voltage Bar */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-300 mb-1">НАПРЯЖЕНИЕ</div>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      aiElectrician.voltage > 300 ? 'bg-red-500' :
                      aiElectrician.voltage > 200 ? 'bg-orange-500' :
                      aiElectrician.voltage > 100 ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(aiElectrician.voltage / aiElectrician.maxVoltage) * 100}%`,
                      boxShadow: aiElectrician.voltage >= 100 ? '0 0 10px rgba(255, 0, 0, 0.8)' : 'none'
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className={`text-xs font-bold ${
                  aiElectrician.voltage >= 100 ? 'text-red-400' : 'text-white'
                }`}>
                  {Math.round(aiElectrician.voltage)}⚡
                </div>
              </div>

              {/* Equipment Status */}
              <div className="flex space-x-2">
                <div className="text-center">
                  <div className="text-xs text-gray-300">БАТ</div>
                  <div className={`text-xs font-bold ${
                    aiElectrician.equipment.battery > 70 ? 'text-green-400' :
                    aiElectrician.equipment.battery > 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {Math.round(aiElectrician.equipment.battery)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-300">КОН</div>
                  <div className={`text-xs font-bold ${
                    aiElectrician.equipment.capacitor > 70 ? 'text-green-400' :
                    aiElectrician.equipment.capacitor > 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {Math.round(aiElectrician.equipment.capacitor)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-300">ПРВ</div>
                  <div className={`text-xs font-bold ${
                    aiElectrician.equipment.wires > 70 ? 'text-green-400' :
                    aiElectrician.equipment.wires > 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {Math.round(aiElectrician.equipment.wires)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-300">ГЕН</div>
                  <div className={`text-xs font-bold ${
                    aiElectrician.equipment.generator > 70 ? 'text-green-400' :
                    aiElectrician.equipment.generator > 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {Math.round(aiElectrician.equipment.generator)}%
                  </div>
                </div>
              </div>

              {/* Working Efficiency */}
              <div className="text-center">
                <div className="text-xs text-gray-300">ЭФФЕКТ</div>
                <div className={`text-sm font-bold ${
                  aiElectrician.workingEfficiency > 80 ? 'text-green-400' :
                  aiElectrician.workingEfficiency > 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {Math.round(aiElectrician.workingEfficiency)}%
                </div>
              </div>

              {/* Success/Failure Stats */}
              <div className="text-center">
                <div className="text-xs text-gray-300">УСПЕХ/НЕУДАЧ</div>
                <div className="text-xs text-green-400">{aiElectrician.successfulDischarges}</div>
                <div className="text-xs text-red-400">{aiElectrician.failuresCount}</div>
              </div>

              {/* Working Status */}
              <div className="text-center">
                <div className={`text-sm font-bold ${
                  aiElectrician.canWork ? 'text-green-400' : 'text-red-400'
                }`}>
                  {aiElectrician.canWork ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}
                </div>
              </div>
            </div>

            {/* Repair Controls */}
            <div className="flex space-x-2 mt-2">
              <motion.button
                className="glass-effect px-3 py-1 text-xs text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={() => {
                  if (player.volts >= 50) {
                    repairAIElectrician('energy');
                    useGameStore.getState().updatePlayerStats({ volts: player.volts - 50 });
                  }
                }}
                disabled={player.volts < 50 || aiElectrician.energy >= 90}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚡ Зарядить (50⚡)
              </motion.button>
              
              <motion.button
                className="glass-effect px-3 py-1 text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={() => {
                  if (player.volts >= 100) {
                    repairAIElectrician('equipment');
                    useGameStore.getState().updatePlayerStats({ volts: player.volts - 100 });
                  }
                }}
                disabled={player.volts < 100 || Object.values(aiElectrician.equipment).every(val => val >= 95)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔧 Починить (100⚡)
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Protection Shop Button */}
      <motion.button
        onClick={() => setShowShop(true)}
        className="fixed bottom-20 left-4 glass-effect px-4 py-2 text-yellow-400 hover:text-yellow-300 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <span>🛡️</span>
          <div>
            <div className="text-sm font-bold">ЗАЩИТА</div>
            <div className="text-xs">{getTotalProtection().toFixed(1)}%</div>
          </div>
        </div>
      </motion.button>

      {/* Protection Shop Modal */}
      <ProtectionShop 
        isOpen={showShop}
        onClose={() => setShowShop(false)}
      />
    </div>
  );
};
