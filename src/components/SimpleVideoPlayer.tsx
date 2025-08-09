import React, { useRef, useEffect } from 'react';
import { soundManager } from '../utils/soundManager';
import electricShockVideo from '../assets/video/electric_shock.mp4';

interface SimpleVideoPlayerProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ 
  isActive, 
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('SimpleVideoPlayer: Effect triggered', { isActive });

    // Добавляем детальную диагностику
    const logVideoState = () => {
      console.log('SimpleVideoPlayer: Video state', {
        src: video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error,
        canPlay: video.readyState >= 3
      });
    };

    // Обработчики для диагностики
    const handleLoadStart = () => console.log('SimpleVideoPlayer: loadstart');
    const handleCanPlay = () => console.log('SimpleVideoPlayer: canplay');
    const handleError = (e: Event) => {
      console.error('SimpleVideoPlayer: Video error', (e.target as HTMLVideoElement).error);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    logVideoState();

  if (isActive) {
      console.log('SimpleVideoPlayer: Starting video');
      video.currentTime = 0;
      video.style.display = 'block';
      
      // Воспроизводим звук тигра одновременно с видео
      soundManager.playTigerSound().catch(error => {
        console.warn('SimpleVideoPlayer: Failed to play tiger sound:', error);
      });
      
      // Пытаемся воспроизвести видео после небольшой задержки
      setTimeout(() => {
        logVideoState();
        video.play().then(() => {
          console.log('SimpleVideoPlayer: Video started successfully');
          (window as any).__shockVideoStarted = true;
        }).catch(error => {
          console.error('SimpleVideoPlayer: Play error:', error);
        });
      }, 100);

      // Обработчик завершения
      const handleEnded = () => {
        console.log('SimpleVideoPlayer: Video ended');
        video.style.display = 'none';
        onComplete?.();
      };

      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    } else {
      // Просто скрываем без остановки
      video.style.display = 'none';
    }
  }, [isActive, onComplete]);

  return (
    <video
      ref={videoRef}
      src={electricShockVideo}
      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
      style={{ display: 'none' }}
      muted
      playsInline
      autoPlay={false}
      preload="auto"
    />
  );
};
