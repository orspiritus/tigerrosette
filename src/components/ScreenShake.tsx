import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScreenShakeProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
  duration?: number;
  onComplete?: () => void;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  isActive,
  intensity = 'medium',
  duration = 500,
  onComplete
}) => {
  const shakeAmount = {
    low: 5,
    medium: 10,
    high: 15,
    extreme: 20
  }[intensity];

  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, -shakeAmount, shakeAmount, -shakeAmount, shakeAmount, 0],
        y: [0, shakeAmount, -shakeAmount, shakeAmount, -shakeAmount, 0],
      }}
      transition={{
        duration: duration / 1000,
        times: [0, 0.1, 0.2, 0.3, 0.4, 1],
        ease: "easeInOut"
      }}
    >
      {/* Red flash overlay */}
      <motion.div
        className="absolute inset-0 bg-red-500 mix-blend-multiply"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0, 0.2, 0] }}
        transition={{ duration: duration / 1000 }}
      />
    </motion.div>
  );
};
