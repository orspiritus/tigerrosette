import React, { useRef, useEffect, useState } from 'react';
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
  const [debugInfo, setDebugInfo] = useState({ readyState: 0, networkState: 0, currentTime: 0, error: '' });
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const [attemptedAutoPlay, setAttemptedAutoPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('SimpleVideoPlayer: Effect triggered', { isActive });

    // Добавляем детальную диагностику
    const logVideoState = () => {
      const payload = {
        src: video.currentSrc || video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error,
        canPlay: video.readyState >= 3,
        currentTime: video.currentTime
      };
      console.log('SimpleVideoPlayer: Video state', payload);
      setDebugInfo({
        readyState: video.readyState,
        networkState: video.networkState,
        currentTime: video.currentTime,
        error: video.error ? String(video.error?.code) : ''
      });
    };

    // Обработчики для диагностики
    const handleLoadStart = () => console.log('SimpleVideoPlayer: loadstart');
    const handleCanPlay = () => { console.log('SimpleVideoPlayer: canplay'); logVideoState(); };
    const handleError = (e: Event) => {
      console.error('SimpleVideoPlayer: Video error', (e.target as HTMLVideoElement).error);
      setNeedsManualPlay(false); // error different than autoplay policy
      logVideoState();
    };
    const handlePlay = () => { console.log('SimpleVideoPlayer: play event'); setNeedsManualPlay(false); };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
  video.addEventListener('error', handleError);
  video.addEventListener('play', handlePlay);

    logVideoState();

  if (isActive) {
      console.log('SimpleVideoPlayer: Starting video');
      video.currentTime = 0;
      video.style.display = 'block';
      video.style.opacity = '1';
      video.style.outline = '2px solid rgba(255,0,0,0.6)';
      
      // Воспроизводим звук тигра одновременно с видео
      soundManager.playTigerSound().catch(error => {
        console.warn('SimpleVideoPlayer: Failed to play tiger sound:', error);
      });
      
      // Пытаемся воспроизвести видео после небольшой задержки
      setTimeout(() => {
        logVideoState();
        setAttemptedAutoPlay(true);
        video.play().then(() => {
          console.log('SimpleVideoPlayer: Video started successfully');
          (window as any).__shockVideoStarted = true;
        }).catch(error => {
          console.error('SimpleVideoPlayer: Play error (autoplay likely blocked):', error);
          setNeedsManualPlay(true);
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
        video.removeEventListener('play', handlePlay);
      };
    } else {
      // Просто скрываем без остановки
      video.style.display = 'none';
      video.style.opacity = '0';
      video.style.outline = 'none';
    }
  }, [isActive, onComplete]);

  return (
    <>
      <video
        ref={videoRef}
        src={electricShockVideo}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        style={{ display: 'none', opacity: 0, transition: 'opacity 120ms linear' }}
        muted
        playsInline
        autoPlay={false}
        preload="auto"
        poster={electricShockVideo}
      />
      {isActive && needsManualPlay && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
          <button
            className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white text-xs rounded-md shadow"
            onClick={() => {
              const v = videoRef.current; if (!v) return;
              v.play().catch(err => console.error('Manual play failed', err));
            }}
          >▶ Воспроизвести</button>
        </div>
      )}
      {isActive && import.meta.env.DEV && (
        <div className="absolute top-0 left-0 m-1 p-1 rounded bg-black/70 text-[10px] leading-tight text-white z-20 space-y-0.5 pointer-events-none">
          <div>ready:{debugInfo.readyState} net:{debugInfo.networkState}</div>
          <div>t:{debugInfo.currentTime.toFixed(2)}s</div>
          <div>aPlay:{String(attemptedAutoPlay)} manual:{String(needsManualPlay)}</div>
          {debugInfo.error && <div className="text-red-400">err:{debugInfo.error}</div>}
        </div>
      )}
    </>
  );
};
