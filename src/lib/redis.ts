import "dotenv/config";
import { createClient, type RedisClientType } from "redis";

const redis: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis client error:", err));

await redis.connect();

export default redis;
