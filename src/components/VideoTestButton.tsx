import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SimpleVideoPlayer } from './SimpleVideoPlayer';

export const VideoTestButton: React.FC = () => {
  const [showTestVideo, setShowTestVideo] = useState(false);

  const handleTestVideo = () => {
    console.log('VideoTestButton: Manual video test - setting active to true');
    setShowTestVideo(true);
    setTimeout(() => {
      console.log('VideoTestButton: Test video timeout - setting active to false');
      setShowTestVideo(false);
    }, 10000); // Увеличили до 10 секунд для полного просмотра
  };

  return (
    <>
      <motion.button
        onClick={handleTestVideo}
        className="fixed top-20 right-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Test Video
      </motion.button>

      {/* Простой видео плеер без сложных анимаций */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <SimpleVideoPlayer
          isActive={showTestVideo}
          onComplete={() => {
            console.log('VideoTestButton: Video completed, deactivating');
            setShowTestVideo(false);
          }}
          intensity="high"
        />
      </div>
    </>
  );
};
