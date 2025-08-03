import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';

interface UseApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface GameScoreData {
  score: number;
  level: number;
  timePlayed: number;
}

/**
 * Хук для работы с игровым API
 */
export function useGameApi() {
  const [submitState, setSubmitState] = useState<UseApiState>({
    data: null,
    loading: false,
    error: null,
  });

  const [statsState, setStatsState] = useState<UseApiState>({
    data: null,
    loading: false,
    error: null,
  });

  const [leaderboardState, setLeaderboardState] = useState<UseApiState>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Отправляет очки на сервер
   */
  const submitScore = useCallback(async (scoreData: GameScoreData) => {
    setSubmitState({ data: null, loading: true, error: null });

    try {
      const response = await apiClient.submitScore(scoreData);
      
      if (response.error) {
        setSubmitState({ data: null, loading: false, error: response.error });
        return { success: false, error: response.error };
      }

      setSubmitState({ data: response.data, loading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubmitState({ data: null, loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Получает статистику пользователя
   */
  const getUserStats = useCallback(async () => {
    setStatsState({ data: null, loading: true, error: null });

    try {
      const response = await apiClient.getUserStats();
      
      if (response.error) {
        setStatsState({ data: null, loading: false, error: response.error });
        return { success: false, error: response.error };
      }

      setStatsState({ data: response.data, loading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatsState({ data: null, loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Получает таблицу лидеров
   */
  const getLeaderboard = useCallback(async (type: 'level' | 'volts' | 'experience' = 'level', limit = 10) => {
    setLeaderboardState({ data: null, loading: true, error: null });

    try {
      const response = await apiClient.getLeaderboard(type, limit);
      
      if (response.error) {
        setLeaderboardState({ data: null, loading: false, error: response.error });
        return { success: false, error: response.error };
      }

      setLeaderboardState({ data: response.data, loading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLeaderboardState({ data: null, loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Восстанавливает энергию
   */
  const refillEnergy = useCallback(async () => {
    try {
      const response = await apiClient.refillEnergy();
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    // Методы
    submitScore,
    getUserStats,
    getLeaderboard,
    refillEnergy,
    
    // Состояния
    submitState,
    statsState,
    leaderboardState,
    
    // Статусы аутентификации
    isAuthenticated: apiClient.isAuthenticated(),
  };
}

/**
 * Простой хук для offline/online режима
 */
export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  return { isOnline };
}
