import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: any;
  contentType: string;
  timestamp: number;
  ttlMs: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Cache middleware for GET endpoints.
 * @param ttlSeconds Time-to-live in seconds (default 60s)
 */
export const cacheResponse = (ttlSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if cache-control: no-cache header is sent
    if (req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    const cacheKey = req.originalUrl || req.url;
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && now - cached.timestamp < cached.ttlMs) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttlSeconds / 2)}, stale-while-revalidate=${ttlSeconds}`);
      res.setHeader('Content-Type', cached.contentType || 'application/json');
      res.send(cached.body);
      return;
    }

    // Hijack res.send to store response in memory cache
    const originalSend = res.send.bind(res);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttlSeconds / 2)}, stale-while-revalidate=${ttlSeconds}`);

    res.send = (body: any): Response => {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && body !== undefined && body !== null) {
        memoryCache.set(cacheKey, {
          body,
          contentType: res.getHeader('Content-Type') as string || 'application/json',
          timestamp: Date.now(),
          ttlMs: ttlSeconds * 1000,
        });

        // Cap memory cache size to avoid memory leaks
        if (memoryCache.size > 500) {
          const oldestKey = memoryCache.keys().next().value;
          if (oldestKey) memoryCache.delete(oldestKey);
        }
      }
      return originalSend(body);
    };

    next();
  };
};

/**
 * Invalidate cache entries matching a prefix or pattern.
 * e.g. invalidateCache('/api/products')
 */
export const invalidateCache = (prefixOrPattern?: string): void => {
  if (!prefixOrPattern) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.includes(prefixOrPattern)) {
      memoryCache.delete(key);
    }
  }
};
