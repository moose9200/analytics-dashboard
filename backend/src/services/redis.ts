import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connected'));

export const cacheGet = async (key: string) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 300) => {
  await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
};

export const cacheDelete = async (key: string) => {
  await redisClient.del(key);
};

export const cacheDeletePattern = async (pattern: string) => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

redisClient.connect().catch(console.error);

export { redisClient };