import { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisAvailable } from "../config/redis";

// ─── Key Building ───────────────────────────────────────────────

const buildCacheKey = (prefix: string, req: Request): string => {
  const allParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.params)) {
    if (value) allParams[key] = String(value);
  }

  for (const [key, value] of Object.entries(req.query)) {
    if (value !== undefined && value !== null) allParams[key] = String(value);
  }

  const sortedKeys = Object.keys(allParams).sort();
  const hash = sortedKeys.map((k) => `${k}:${allParams[k]}`).join("_");
  return hash ? `${prefix}:${hash}` : prefix;
};

// ─── Cache Middleware (for GET routes) ──────────────────────────

export const cacheMiddleware = (prefix: string, ttlSeconds: number = 60) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!isRedisAvailable()) {
      next();
      return;
    }

    const key = buildCacheKey(prefix, req);

    try {
      const client = getRedisClient();
      const cached = await client.get(key);

      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }

      // Cache MISS — intercept res.json to capture the response
      const originalJson = res.json.bind(res);
      res.json = ((body: unknown) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          client
            .setEx(key, ttlSeconds, JSON.stringify(body))
            .catch((err: Error) => {
              console.error(`Redis cache write error: ${err.message}`);
            });
        }
        return originalJson(body);
      }) as typeof res.json;

      next();
    } catch (err) {
      console.error(`Redis cache read error: ${err}`);
      next();
    }
  };
};

// ─── Cache Invalidation Utility ─────────────────────────────────

export const invalidateCache = async (...patterns: string[]): Promise<void> => {
  if (!isRedisAvailable()) return;

  const client = getRedisClient();

  try {
    for (const pattern of patterns) {
      // Use SCAN to find matching keys (non-blocking, unlike KEYS)
      let cursor: string = "0";
      do {
        const result = await client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = String(result.cursor);

        if (result.keys.length > 0) {
          await client.del(result.keys);
        }
      } while (cursor !== "0");
    }
  } catch (err) {
    console.error(`Redis invalidation error: ${err}`);
  }
};
