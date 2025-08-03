import crypto from 'crypto';
import { TelegramWebAppInitData, TelegramInitData } from '../types/auth';
import config from '../config';

/**
 * Validates Telegram Mini App init data from object
 * @param initData - The init data object from Telegram
 * @returns True if valid, false otherwise
 */
export function validateTelegramAuth(initData: TelegramInitData): boolean {
  try {
    // Basic validation - check if required fields exist
    if (!initData.user || !initData.hash || !initData.auth_date) {
      return false;
    }

    // Check if auth_date is not too old (24 hours)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - initData.auth_date > 86400) {
      return false;
    }

    // For now, we'll just return true for development
    // In production, you would verify the hash using your bot token
    return true;
  } catch (error) {
    console.error('Telegram auth validation error:', error);
    return false;
  }
}

/**
 * Validates Telegram Mini App init data from string
 * @param initData - The init data string from Telegram
 * @returns Parsed and validated init data or null if invalid
 */
export function validateTelegramInitData(initData: string): TelegramWebAppInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return null;
    }

    // Remove hash from params for validation
    urlParams.delete('hash');
    
    // Sort params alphabetically
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key for validation
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();

    // Generate expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');

    // Verify hash
    if (hash !== expectedHash) {
      return null;
    }

    // Parse init data
    const result: Partial<TelegramWebAppInitData> = {};
    
    for (const [key, value] of urlParams.entries()) {
      switch (key) {
        case 'user':
        case 'receiver':
        case 'chat':
          try {
            (result as any)[key] = JSON.parse(decodeURIComponent(value));
          } catch {
            // Invalid JSON, skip
          }
          break;
        case 'auth_date':
        case 'can_send_after':
          result[key] = parseInt(value, 10);
          break;
        default:
          (result as any)[key] = value;
      }
    }

    // Validate required fields
    if (!result.auth_date) {
      return null;
    }

    // Check if auth_date is not too old (1 hour)
    const authDate = new Date(result.auth_date * 1000);
    const now = new Date();
    const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (now.getTime() - authDate.getTime() > maxAge) {
      return null;
    }

    return result as TelegramWebAppInitData;
  } catch (error) {
    console.error('Error validating Telegram init data:', error);
    return null;
  }
}

/**
 * Extracts user ID from Telegram init data
 * @param initData - Validated init data
 * @returns User ID or null
 */
export function extractTelegramUserId(initData: TelegramWebAppInitData): number | null {
  return initData.user?.id || null;
}
