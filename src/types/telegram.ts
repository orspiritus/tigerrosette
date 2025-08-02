/**
 * Типы для Telegram Web App API
 * Включает полное определение интерфейса включая HapticFeedback
 */

export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface TelegramThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color?: string;
}

export interface TelegramMainButton {
  text: string;
  color?: string;
  textColor?: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: () => void;
  hideProgress: () => void;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface TelegramBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: any;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  HapticFeedback: TelegramHapticFeedback;
  
  // Методы
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: (...args: any[]) => void) => void;
  offEvent: (eventType: string, callback: (...args: any[]) => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export default TelegramWebApp;
