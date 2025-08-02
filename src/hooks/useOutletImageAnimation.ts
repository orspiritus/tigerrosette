import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getOutletImageByLevel } from '../utils/levelSystem';

export const useOutletImageAnimation = () => {
  const { player } = useGameStore();
  const [currentImage, setCurrentImage] = useState(getOutletImageByLevel(player.level));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const newImage = getOutletImageByLevel(player.level);
    console.log(`Player level: ${player.level}, Image path: ${newImage}`);
    
    if (newImage !== currentImage) {
      // Start animation
      setIsAnimating(true);
      
      // Change image after a brief delay
      setTimeout(() => {
        setCurrentImage(newImage);
        setIsAnimating(false);
      }, 300);
    }
  }, [player.level, currentImage]);

  return {
    currentImage,
    isAnimating
  };
};
