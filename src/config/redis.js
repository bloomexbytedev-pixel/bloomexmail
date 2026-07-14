import IORedis from "ioredis";

const redis = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    })
  : new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

export default redis;
