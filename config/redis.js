const redis = require("redis");
const colors = require("colors");

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:".red, err);
    });

    redisClient.on("connect", () => {
      console.log("Redis connecting...".yellow);
    });

    redisClient.on("ready", () => {
      console.log("Redis client connected and ready".green.bold);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis connection failed:".red.bold, error.message);
    console.log("Continuing without Redis cache...".yellow);
    return null;
  }
};

// Get the Redis client
const getRedisClient = () => redisClient;

// Check if Redis is connected
const isRedisConnected = () => {
  return redisClient && redisClient.isOpen;
};

module.exports = { connectRedis, getRedisClient, isRedisConnected };
