import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ElectricShockVideoProps {
  isActive: boolean;
  onComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
}

export const ElectricShockVideo: React.FC<ElectricShockVideoProps> = ({ 
  isActive, 
  onComplete,
  intensity = 'high'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Debug logging
  console.log('ElectricShockVideo render:', { isActive, intensity, isVideoLoaded, isPlaying });

  // Загружаем URL видео
  useEffect(() => {
    // Используем правильный URL для Vite с базовым путем
    const videoUrl = '/tigerrosette/Media/video/electric_shock.mp4';
    setVideoSrc(videoUrl);
    console.log('ElectricShockVideo: Using video URL:', videoUrl);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('ElectricShockVideo: Video loaded successfully');
      setIsVideoLoaded(true);
    };

    const handleCanPlay = () => {
      console.log('ElectricShockVideo: Video can start playing');
    };

    const handleLoadStart = () => {
      console.log('ElectricShockVideo: Video loading started');
    };

    const handleEnded = () => {
      console.log('ElectricShockVideo: Video ended');
      setIsPlaying(false);
      onComplete?.();
    };

    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      console.error('ElectricShockVideo: Video error', {
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
        src: video.src
      });
      setIsPlaying(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    console.log('ElectricShockVideo: useEffect triggered', { 
      isActive, 
      isVideoLoaded, 
      video: !!video,
      videoSrc,
      videoReadyState: video?.readyState,
      videoNetworkState: video?.networkState
    });
    
    if (!video || !videoSrc) return;
    
    if (isActive && !isPlaying) {
      console.log('ElectricShockVideo: Attempting to play video');
      video.currentTime = 0;
      setIsPlaying(true);
      
      // Сохраняем Promise для отслеживания
      const playPromise = video.play();
      playPromiseRef.current = playPromise;
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('ElectricShockVideo: Video started playing successfully');
          })
          .catch((error) => {
            console.error('ElectricShockVideo: Failed to play video', error);
            setIsPlaying(false);
          });
      }
    }
    
    // Cleanup функция для безопасного прерывания
    return () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {
          // Игнорируем ошибки при cleanup
        });
      }
    };
  }, [isActive, videoSrc, isPlaying]);

  // Настройки эффекта в зависимости от интенсивности
  const getIntensitySettings = () => {
    switch (intensity) {
      case 'extreme':
        return {
          scale: 1.2,
          opacity: 0.9,
          blur: 2,
          brightness: 1.3
        };
      case 'high':
        return {
          scale: 1.1,
          opacity: 0.8,
          blur: 1,
          brightness: 1.2
        };
      case 'medium':
        return {
          scale: 1.05,
          opacity: 0.7,
          blur: 0.5,
          brightness: 1.1
        };
      case 'low':
      default:
        return {
          scale: 1.0,
          opacity: 0.6,
          blur: 0,
          brightness: 1.0
        };
    }
  };

  const { scale, opacity, blur, brightness } = getIntensitySettings();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Основное видео - занимает всё пространство розетки */}
          <video
            ref={videoRef}
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            style={{
              transform: `scale(${scale})`,
              filter: `blur(${blur}px) brightness(${brightness})`,
              opacity
            }}
            muted
            playsInline
            preload="auto"
            onLoadStart={() => console.log('Video load start inline, src:', videoSrc)}
            onCanPlay={() => console.log('Video can play inline, src:', videoSrc)}
            onError={(e) => {
              console.error('Video error inline, src:', videoSrc);
              console.error('Error event:', e);
            }}
          />

          {/* Запасной визуальный эффект, если видео не загружается */}
          {!isVideoLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-radial from-blue-500/30 via-purple-500/20 to-transparent"
            />
          )}

          {/* Полноэкранное затемнение */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />

          {/* Видео анимация */}
          <motion.div
            animate={{ 
              scale: [1, scale, 1],
              rotate: [0, Math.random() * 4 - 2, 0]
            }}
            transition={{ 
              duration: 0.3,
              repeat: 2,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{
                filter: `blur(${blur}px) brightness(${brightness})`,
                opacity,
                maxWidth: '100vw',
                maxHeight: '100vh',
                width: 'auto',
                height: 'auto'
              }}
              muted
              playsInline
              preload="auto"
            >
              <source src="/Media/video/electric_shock.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Дополнительные эффекты */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 0.6,
              repeat: 1,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-radial from-blue-400/20 via-purple-500/10 to-transparent"
          />

          {/* Эффект вспышки */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 0.1,
              repeat: 3,
              repeatDelay: 0.1
            }}
            className="absolute inset-0 bg-white/20"
          />

          {/* Эффект электрических искр по краям */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(255, 255, 0, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 60% 20%, rgba(255, 0, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.3) 0%, transparent 50%)'
              ]
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
