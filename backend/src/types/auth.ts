export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
  };
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface AuthenticatedUser {
  id: string;
  telegramId: bigint;
  username?: string;
  firstName: string;
  lastName?: string;
  level: number;
  totalExperience: number;
  totalVolts: number;
  premiumVolts: number;
  energy: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  user: TelegramUser;
  chat_type?: string;
  chat_instance?: string;
  auth_date: number;
  hash: string;
}

export interface JWTPayload {
  userId: string;
  telegramId: number;
  iat: number;
  exp: number;
}
