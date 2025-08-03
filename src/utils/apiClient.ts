/**
 * API клиент для взаимодействия с backend
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}

interface GameScoreData {
  score: number;
  level: number;
  timePlayed: number;
}

interface GameScoreResponse {
  success: boolean;
  experienceGained: number;
  voltsGained: number;
  levelUpReward: number;
  leveledUp: boolean;
  newLevel: number;
  levelProgress: {
    currentLevel: number;
    experienceInLevel: number;
    experienceToNextLevel: number;
    progressPercentage: number;
  };
  newEnergy: number;
  totalExperience: number;
  totalVolts: number;
}

interface UserStats {
  level: number;
  totalExperience: number;
  levelProgress: {
    currentLevel: number;
    experienceInLevel: number;
    experienceToNextLevel: number;
    progressPercentage: number;
  };
  totalVolts: number;
  premiumVolts: number;
  energy: number;
  maxEnergy: number;
  energyLastRefilled: string;
  totalSessions: number;
  bestScore: number;
  totalTimePlayed: number;
  recentSessions: Array<{
    id: string;
    score: number;
    level: number;
    experienceGained: number;
    voltsGained: number;
    timePlayed: number;
    playedAt: string;
  }>;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  level: number;
  totalExperience: number;
  totalVolts: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Получаем токен из localStorage или Telegram WebApp
    this.token = localStorage.getItem('auth_token');
    this.initializeTelegramAuth();
  }

  private initializeTelegramAuth() {
    // Инициализация аутентификации через Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      if (webApp.initDataUnsafe?.user) {
        // Автоматическая аутентификация через Telegram
        this.authenticateWithTelegram(webApp.initData);
      }
    }
  }

  private async authenticateWithTelegram(initData: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      const data = await response.json();
      
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
      }
    } catch (error) {
      console.error('Telegram authentication failed:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // === ИГРОВЫЕ МЕТОДЫ ===

  /**
   * Отправляет результаты игры на сервер
   */
  async submitScore(scoreData: GameScoreData): Promise<ApiResponse<GameScoreResponse>> {
    return this.makeRequest<GameScoreResponse>('/game/score', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  }

  /**
   * Получает статистику пользователя
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.makeRequest<UserStats>('/game/stats');
  }

  /**
   * Получает таблицу лидеров
   */
  async getLeaderboard(type: 'level' | 'volts' | 'experience' = 'level', limit = 10): Promise<ApiResponse<{ leaderboard: LeaderboardEntry[] }>> {
    return this.makeRequest<{ leaderboard: LeaderboardEntry[] }>(`/game/leaderboard?type=${type}&limit=${limit}`);
  }

  /**
   * Восстанавливает энергию
   */
  async refillEnergy(): Promise<ApiResponse<{
    success: boolean;
    energyRefilled: number;
    newEnergy: number;
    maxEnergy: number;
  }>> {
    return this.makeRequest('/game/refill-energy', {
      method: 'POST',
    });
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  /**
   * Проверяет, аутентифицирован ли пользователь
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Устанавливает токен аутентификации
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Очищает токен аутентификации
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

// Экспортируем единственный экземпляр
export const apiClient = new ApiClient();
export default apiClient;
