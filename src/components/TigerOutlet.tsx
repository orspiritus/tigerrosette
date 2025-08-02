import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { SparkEffect } from '../types/game';
import { soundManager } from '../utils/soundManager';
import { ScorePopup } from './ScorePopup';

interface TigerOutletProps {
  className?: string;
}

export const TigerOutlet: React.FC<TigerOutletProps> = ({ className = '' }) => {
  const { 
    clickOutlet, 
    singleMode, 
    gameState,
    updateScore 
  } = useGameStore();
  
  const [sparks, setSparks] = useState<SparkEffect[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(1);
  const [scorePopup, setScorePopup] = useState<{
    visible: boolean;
    score: number;
    reason: string;
    type: 'success' | 'shock' | 'bonus';
  }>({ visible: false, score: 0, reason: '', type: 'success' });

  // Show score popup
  const showScorePopup = useCallback((score: number, reason: string, type: 'success' | 'shock' | 'bonus') => {
    setScorePopup({ visible: true, score, reason, type });
    setTimeout(() => {
      setScorePopup(prev => ({ ...prev, visible: false }));
    }, 2000);
  }, []);

  // Create spark effect on click
  const createSparks = useCallback((intensity: 'low' | 'medium' | 'high' | 'extreme') => {
    const sparkCount = {
      low: 3,
      medium: 6,
      high: 12,
      extreme: 20
    }[intensity];

    const newSparks: SparkEffect[] = Array.from({ length: sparkCount }, (_, i) => ({
      id: `spark-${Date.now()}-${i}`,
      x: Math.random() * 200 - 100, // Random position around center
      y: Math.random() * 200 - 100,
      intensity,
      duration: 300 + Math.random() * 200,
      color: intensity === 'extreme' ? '#E8FF00' : 
             intensity === 'high' ? '#00D4FF' : 
             intensity === 'medium' ? '#8A2BE2' : '#FF6B35'
    }));

    setSparks(prev => [...prev, ...newSparks]);

    // Remove sparks after animation
    newSparks.forEach(spark => {
      setTimeout(() => {
        setSparks(prev => prev.filter(s => s.id !== spark.id));
      }, spark.duration);
    });
  }, []);

  // Handle outlet click
  const handleClick = useCallback(() => {
    if (!gameState.isPlaying || singleMode.shockActive) return;

    setIsPressed(true);
    clickOutlet();

    // Determine if shock occurs (simplified logic for now)
    const shockChance = {
      easy: 0.15,
      medium: 0.25,
      hard: 0.35,
      extreme: 0.50
    }[singleMode.difficulty];

    const isShocked = Math.random() < shockChance;
    
    if (isShocked) {
      // Shock effect
      createSparks('extreme');
      setGlowIntensity(3);
      
      // Play shock sound
      soundManager.generateShockSound();
      
      // Calculate shock score (consolation prize)
      const scoreData = {
        basePoints: 8,
        riskMultiplier: 1,
        streakBonus: 0,
        timeBonus: 0,
        totalPoints: 8 + Math.floor(Math.random() * 17), // 8-25 points
        reason: 'Поражение током'
      };
      
      updateScore(scoreData);
      showScorePopup(scoreData.totalPoints, scoreData.reason, 'shock');
    } else {
      // Success effect
      const intensity = singleMode.currentRisk === 'extreme' ? 'extreme' :
                       singleMode.currentRisk === 'high' ? 'high' :
                       singleMode.currentRisk === 'medium' ? 'medium' : 'low';
      
      createSparks(intensity);
      setGlowIntensity(2);

      // Play spark sound based on intensity
      soundManager.generateSparkSound(intensity);

      // Calculate success score
      const basePoints = 10;
      const riskMultiplier = {
        low: 1.0,
        medium: 1.5,
        high: 2.0,
        extreme: 3.0
      }[singleMode.currentRisk];

      const streakBonus = singleMode.streakCount >= 25 ? 3.0 :
                         singleMode.streakCount >= 10 ? 2.0 :
                         singleMode.streakCount >= 5 ? 1.5 : 1.0;

      const totalPoints = Math.floor(basePoints * riskMultiplier * streakBonus);

      const scoreData = {
        basePoints,
        riskMultiplier,
        streakBonus,
        timeBonus: 0,
        totalPoints,
        reason: `Выживание (${singleMode.currentRisk} риск)`
      };

      updateScore(scoreData);
      showScorePopup(scoreData.totalPoints, scoreData.reason, 'success');
    }

    // Reset visual effects
    setTimeout(() => {
      setIsPressed(false);
      setGlowIntensity(1);
    }, 200);
  }, [gameState.isPlaying, singleMode, clickOutlet, createSparks, updateScore]);

  // Warning effect when danger is imminent
  useEffect(() => {
    if (singleMode.warningActive) {
      setGlowIntensity(2.5);
      const interval = setInterval(() => {
        setGlowIntensity(prev => prev === 2.5 ? 1.5 : 2.5);
      }, 200);

      return () => clearInterval(interval);
    } else {
      setGlowIntensity(1);
    }
  }, [singleMode.warningActive]);

  return (
    <div className={`relative ${className}`}>
      {/* Main Outlet Button */}
      <motion.button
        onClick={handleClick}
        disabled={!gameState.isPlaying || singleMode.shockActive}
        className="relative w-64 h-64 rounded-2xl overflow-hidden disabled:opacity-50"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        animate={{
          scale: isPressed ? 0.9 : 1,
          filter: `brightness(${glowIntensity}) saturate(${glowIntensity})`
        }}
        style={{
          backgroundImage: 'url(/Media/Pictures/tigrrozetka5.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `0 0 ${20 * glowIntensity}px rgba(255, 107, 53, ${0.5 * glowIntensity})`
        }}
      >
        {/* Tiger Stripes Overlay */}
        <div className="absolute inset-0 tiger-stripes opacity-20 mix-blend-overlay" />
        
        {/* Electric Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: singleMode.warningActive
              ? '0 0 30px #E8FF00, inset 0 0 30px #E8FF00'
              : singleMode.shockActive
              ? '0 0 50px #FF0000, inset 0 0 50px #FF0000'
              : '0 0 15px #FF6B35, inset 0 0 15px #FF6B35'
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Shock Effect Overlay */}
        <AnimatePresence>
          {singleMode.shockActive && (
            <motion.div
              className="absolute inset-0 bg-red-500 mix-blend-screen rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0, 0.6, 0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Spark Effects */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              backgroundColor: spark.color,
              boxShadow: `0 0 10px ${spark.color}`,
              left: '50%',
              top: '50%'
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1
            }}
            animate={{
              x: spark.x,
              y: spark.y,
              scale: [0, 1.5, 0.8, 0],
              opacity: [1, 1, 0.5, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: spark.duration / 1000,
              ease: 'easeOut'
            }}
          />
        ))}
      </AnimatePresence>

      {/* Risk Level Indicator */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          singleMode.currentRisk === 'extreme' ? 'bg-red-500 text-white' :
          singleMode.currentRisk === 'high' ? 'bg-orange-500 text-white' :
          singleMode.currentRisk === 'medium' ? 'bg-yellow-500 text-black' :
          'bg-green-500 text-white'
        }`}>
          {singleMode.currentRisk === 'extreme' ? 'ЭКСТРИМ' :
           singleMode.currentRisk === 'high' ? 'ВЫСОКИЙ' :
           singleMode.currentRisk === 'medium' ? 'СРЕДНИЙ' : 'НИЗКИЙ'} РИСК
        </div>
      </div>

      {/* Score Popup */}
      <ScorePopup
        score={scorePopup.score}
        reason={scorePopup.reason}
        isVisible={scorePopup.visible}
        position={{ x: 0, y: -32 }}
        type={scorePopup.type}
      />
    </div>
  );
};
