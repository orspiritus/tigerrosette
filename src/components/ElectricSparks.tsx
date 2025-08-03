import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ElectricSparksProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
  onComplete?: () => void;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  delay: number;
  color: string;
}

export const ElectricSparks: React.FC<ElectricSparksProps> = ({
  isActive,
  intensity = 'medium',
  onComplete
}) => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    if (isActive) {
      generateSparks();
    } else {
      setSparks([]);
    }
  }, [isActive, intensity]);

  const generateSparks = () => {
    const sparkCount = {
      low: 6,
      medium: 12,
      high: 18,
      extreme: 25
    }[intensity];

    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#FFFFFF', // white
      '#FBBF24', // yellow
      '#8B5CF6', // purple
    ];

    const newSparks: Spark[] = [];

    for (let i = 0; i < sparkCount; i++) {
      newSparks.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        angle: Math.random() * 360,
        length: 20 + Math.random() * 60,
        delay: Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setSparks(newSparks);

    // Auto cleanup after animation
    setTimeout(() => {
      setSparks([]);
      onComplete?.();
    }, 1000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="absolute"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
              transform: `rotate(${spark.angle}deg)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0.7, 0],
              scale: [0, 1, 0.8, 0],
              x: [0, Math.cos(spark.angle * Math.PI / 180) * spark.length],
              y: [0, Math.sin(spark.angle * Math.PI / 180) * spark.length]
            }}
            transition={{
              duration: 0.6,
              delay: spark.delay,
              ease: "easeOut"
            }}
          >
            {/* Main spark line */}
            <div
              className="w-1 bg-gradient-to-r opacity-90 rounded-full shadow-lg"
              style={{
                height: `${spark.length}px`,
                backgroundColor: spark.color,
                boxShadow: `0 0 8px ${spark.color}, 0 0 16px ${spark.color}40`
              }}
            />
            
            {/* Spark glow effect */}
            <div
              className="absolute top-0 left-0 w-1 blur-sm opacity-60 rounded-full"
              style={{
                height: `${spark.length}px`,
                backgroundColor: spark.color,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Electric discharge effect - jagged lines */}
      <AnimatePresence>
        {isActive && (
          <motion.svg
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0.2, 0.9, 0] }}
            transition={{ duration: 0.8, times: [0, 0.1, 0.3, 0.5, 0.7, 1] }}
          >
            {/* Jagged lightning lines */}
            {Array.from({ length: 3 }, (_, i) => {
              const startX = 20 + Math.random() * 60;
              const startY = 20 + Math.random() * 60;
              const segments = 5 + Math.floor(Math.random() * 5);
              
              let path = `M ${startX} ${startY}`;
              let currentX = startX;
              let currentY = startY;
              
              for (let j = 0; j < segments; j++) {
                currentX += (Math.random() - 0.5) * 40;
                currentY += (Math.random() - 0.5) * 40;
                path += ` L ${currentX} ${currentY}`;
              }

              return (
                <motion.path
                  key={i}
                  d={path}
                  stroke="#FFFFFF"
                  strokeWidth={Math.random() * 2 + 1}
                  fill="none"
                  opacity={0.8}
                  filter="drop-shadow(0 0 4px #3B82F6)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ 
                    duration: 0.3,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Screen flash effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-white mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.1, 0.3, 0] }}
            transition={{ duration: 0.5, times: [0, 0.1, 0.3, 0.6, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
