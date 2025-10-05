import redis from "../lib/redis.js";

export const cacheWrap = async <T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
) => {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const result = await fetcher();
  await redis.setEx(key, ttl, JSON.stringify(result));

  return result;
};
