import { createClient, RedisClientType } from 'redis';
import 'colors';

let redisClient: RedisClientType;
let isRedisConnected = false;

const connectRedis = async (): Promise<RedisClientType> => {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.log(
            'Redis: Max reconnection attempts reached. Running without cache.'
              .yellow
          );
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('connect', () => {
    console.log('Redis connected'.cyan.bold);
    isRedisConnected = true;
  });

  redisClient.on('error', (err: Error) => {
    console.error(`Redis error: ${err.message}`.red);
    isRedisConnected = false;
  });

  redisClient.on('end', () => {
    console.log('Redis disconnected'.yellow);
    isRedisConnected = false;
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.error(`Redis connection failed: ${err}`.red);
    // Do NOT process.exit -- app continues without cache
  }

  return redisClient;
};

export const getRedisClient = (): RedisClientType => redisClient;
export const isRedisAvailable = (): boolean => isRedisConnected;
export default connectRedis;
