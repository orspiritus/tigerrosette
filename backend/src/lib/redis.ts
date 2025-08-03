import { createClient } from 'redis';
import config from '../config';

const redis = createClient({
  url: config.redisUrl,
});

redis.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

export default redis;
