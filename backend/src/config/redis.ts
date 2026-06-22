import IORedis from "ioredis";
import { config } from "./index";

export const redis = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 10000,
  tls: config.redisUrl.startsWith("rediss://") ? {} : undefined,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

// Separate connection for BullMQ (BullMQ requires maxRetriesPerRequest: null)
export function createRedisConnection() {
  return new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 10000,
    tls: config.redisUrl.startsWith("rediss://") ? {} : undefined,
  });
}
