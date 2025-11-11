const { getRedisClient, isRedisConnected } = require("../config/redis");

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @param {string} keyPrefix - Optional prefix for cache key
 */
const cache = (duration = 300, keyPrefix = "") => {
  return async (req, res, next) => {
    // Skip caching if Redis is not connected
    if (!isRedisConnected()) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      const redisClient = getRedisClient();

      // Generate cache key from URL and query params
      const cacheKey = `${keyPrefix}${req.originalUrl || req.url}`;

      // Try to get cached data
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`.green);
        return res.status(200).json({
          ...JSON.parse(cachedData),
          cached: true,
        });
      }

      console.log(`Cache MISS: ${cacheKey}`.yellow);

      // Store the original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        redisClient
          .setEx(cacheKey, duration, JSON.stringify(data))
          .catch((err) => console.error("Redis setEx error:".red, err));

        // Call the original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:".red, error);
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Pattern to match keys (e.g., "items:*")
 */
const clearCache = async (pattern) => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache keys matching: ${pattern}`.cyan);
    }
  } catch (error) {
    console.error("Clear cache error:".red, error);
  }
};

/**
 * Clear specific cache key
 * @param {string} key - Exact key to clear
 */
const clearCacheKey = async (key) => {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const redisClient = getRedisClient();
    await redisClient.del(key);
    console.log(`Cleared cache key: ${key}`.cyan);
  } catch (error) {
    console.error("Clear cache key error:".red, error);
  }
};

module.exports = { cache, clearCache, clearCacheKey };
