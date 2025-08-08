import React, { useRef, useEffect } from 'react';

interface SimpleVideoPlayerProps {
  isActive: boolean;
  onComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ 
  isActive, 
  onComplete,
  intensity = 'high'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('SimpleVideoPlayer: Effect triggered', { isActive });

    if (isActive) {
      console.log('SimpleVideoPlayer: Starting video');
      video.currentTime = 0;
      video.style.display = 'block';
      
      // Простое воспроизведение без Promise обработки
      video.play().catch(error => {
        console.log('SimpleVideoPlayer: Play error (ignored):', error.name);
      });

      // Обработчик завершения
      const handleEnded = () => {
        console.log('SimpleVideoPlayer: Video ended');
        video.style.display = 'none';
        onComplete?.();
      };

      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('ended', handleEnded);
      };
    } else {
      // Просто скрываем без остановки
      video.style.display = 'none';
    }
  }, [isActive, onComplete]);

  return (
    <video
      ref={videoRef}
      src="/tigerrosette/Media/video/electric_shock.mp4"
      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
      style={{ display: 'none' }}
      muted
      playsInline
      preload="auto"
    />
  );
};
