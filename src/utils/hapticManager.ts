/**
 * Haptic Manager - управление вибрацией в Telegram Mini App
 * Поддерживает различные типы вибрации для игровых событий
 */

import type { TelegramHapticFeedback } from '../types/telegram';

// Типы вибрации Telegram Web App
export type HapticType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type NotificationType = 'error' | 'success' | 'warning';

class HapticManager {
  private hapticFeedback: TelegramHapticFeedback | null = null;
  private isEnabled: boolean = true;
  private isTelegramEnvironment: boolean = false;

  constructor() {
    this.initializeTelegramHaptics();
  }

  /**
   * Инициализация Telegram Haptic API
   */
  private initializeTelegramHaptics(): void {
    try {
      // Проверяем, работаем ли мы в Telegram
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        this.isTelegramEnvironment = true;
        // Проверяем наличие HapticFeedback в объекте WebApp
        const webApp = window.Telegram.WebApp as any;
        if (webApp.HapticFeedback) {
          this.hapticFeedback = webApp.HapticFeedback;
          console.log('Telegram Haptic Feedback initialized');
        } else {
          console.log('HapticFeedback not available in this Telegram version');
        }
      } else {
        console.log('Not in Telegram environment, haptics disabled');
      }
    } catch (error) {
      console.warn('Failed to initialize Telegram haptics:', error);
    }
  }

  /**
   * Включение/выключение вибрации
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Проверка доступности вибрации
   */
  isAvailable(): boolean {
    return this.isTelegramEnvironment && this.hapticFeedback !== null && this.isEnabled;
  }

  /**
   * Базовая вибрация для нажатий
   */
  light(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.impactOccurred('light');
    } else {
      this.fallbackVibration(50);
    }
  }

  /**
   * Средняя вибрация для важных действий
   */
  medium(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.impactOccurred('medium');
    } else {
      this.fallbackVibration(100);
    }
  }

  /**
   * Сильная вибрация для критических событий
   */
  heavy(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.impactOccurred('heavy');
    } else {
      this.fallbackVibration(150);
    }
  }

  /**
   * Мягкая вибрация для деликатных действий
   */
  soft(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.impactOccurred('soft');
    } else {
      this.fallbackVibration(30);
    }
  }

  /**
   * Жесткая вибрация для резких действий
   */
  rigid(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.impactOccurred('rigid');
    } else {
      this.fallbackVibration(200);
    }
  }

  /**
   * Вибрация для уведомлений
   */
  success(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.notificationOccurred('success');
    } else {
      this.customPattern([100, 50, 100]);
    }
  }

  error(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.notificationOccurred('error');
    } else {
      this.customPattern([200, 100, 200, 100, 200]);
    }
  }

  warning(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.notificationOccurred('warning');
    } else {
      this.customPattern([150, 50, 150]);
    }
  }

  /**
   * Вибрация при изменении выбора
   */
  selection(): void {
    if (this.isAvailable()) {
      this.hapticFeedback!.selectionChanged();
    } else {
      this.fallbackVibration(25);
    }
  }

  // ==================== ИГРОВЫЕ СОБЫТИЯ ====================

  /**
   * Вибрация при нажатии на розетку
   */
  outletPress(): void {
    this.medium();
  }

  /**
   * Вибрация при успешном выживании
   */
  survivalSuccess(): void {
    this.success();
  }

  /**
   * Вибрация при поражении током
   */
  electricShock(): void {
    this.rigid();
    // Дополнительная вибрация через 100мс
    setTimeout(() => {
      if (this.isEnabled) this.heavy();
    }, 100);
  }

  /**
   * Вибрация при повышении уровня
   */
  levelUp(): void {
    // Серия из 3-х вибраций
    this.success();
    setTimeout(() => this.medium(), 150);
    setTimeout(() => this.success(), 300);
  }

  /**
   * Вибрация при получении награды
   */
  rewardReceived(): void {
    this.light();
    setTimeout(() => this.medium(), 100);
  }

  /**
   * Вибрация для серийных достижений
   */
  streakAchievement(streakCount: number): void {
    if (streakCount >= 25) {
      // Мощная вибрация для больших серий
      this.heavy();
      setTimeout(() => this.heavy(), 200);
      setTimeout(() => this.heavy(), 400);
    } else if (streakCount >= 10) {
      // Средняя вибрация для средних серий
      this.medium();
      setTimeout(() => this.medium(), 150);
    } else if (streakCount >= 5) {
      // Легкая вибрация для небольших серий
      this.light();
      setTimeout(() => this.light(), 100);
    }
  }

  /**
   * Вибрация при использовании предмета
   */
  itemUsed(): void {
    this.soft();
  }

  /**
   * Вибрация при покупке в магазине
   */
  shopPurchase(): void {
    this.medium();
    setTimeout(() => this.light(), 100);
  }

  /**
   * Вибрация при входящем вызове в игру
   */
  gameInvitation(): void {
    this.warning();
    setTimeout(() => this.light(), 500);
    setTimeout(() => this.light(), 1000);
  }

  /**
   * Вибрация при начале раунда
   */
  roundStart(): void {
    this.light();
  }

  /**
   * Вибрация при окончании игры
   */
  gameEnd(isWinner: boolean): void {
    if (isWinner) {
      this.success();
      setTimeout(() => this.medium(), 200);
      setTimeout(() => this.success(), 400);
    } else {
      this.error();
    }
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  /**
   * Резервная вибрация для браузеров без Telegram API
   */
  private fallbackVibration(duration: number): void {
    if ('navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (error) {
        console.warn('Vibration not supported:', error);
      }
    }
  }

  /**
   * Кастомный паттерн вибрации
   */
  private customPattern(pattern: number[]): void {
    if ('navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration pattern not supported:', error);
      }
    }
  }

  /**
   * Тестовая вибрация для настроек
   */
  test(): void {
    this.medium();
    setTimeout(() => this.light(), 200);
    setTimeout(() => this.heavy(), 400);
  }
}

// Глобальный экземпляр менеджера вибрации
export const hapticManager = new HapticManager();

export default hapticManager;
