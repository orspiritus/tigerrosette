import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  
  // CORS
  cors: {
    origins: string[];
  };
  
  // Database
  databaseUrl: string;
  redisUrl: string;
  
  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Telegram
  telegramBotToken: string;
  telegramWebhookSecret: string;
  
  // External APIs
  stripeSecretKey: string | undefined;
  stripeWebhookSecret: string | undefined;
  admobAppId: string | undefined;
  
  // Analytics
  analyticsApiKey: string | undefined;
  sentryDsn: string | undefined;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  cors: {
    origins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173', 'https://orspiritus.github.io'],
  },
  
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-for-development-only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  admobAppId: process.env.ADMOB_APP_ID,
  
  analyticsApiKey: process.env.ANALYTICS_API_KEY,
  sentryDsn: process.env.SENTRY_DSN,
  
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'TELEGRAM_BOT_TOKEN'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Validate JWT secret length
if (config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export default config;
