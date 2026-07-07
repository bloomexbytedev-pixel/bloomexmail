import IORedis from "ioredis";

const redis = new IORedis({
  host: "localhost",
  port: 6379,
});
redis.set("test", "hello");
const value = await redis.get("test");
console.log(value); // Output: "hello"
process.exit();
