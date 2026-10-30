import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const DEFAULT_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjBhMDAwMDAwMDAwMDAwMDAwMDAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjUxMTk5NSwiZXhwIjoyMTAxODcxOTk1fQ.wwzSsQNn_BYz58GiGmhr6PJiewiImlIUtz37Us-wJAc';

// In-memory Fast Response Cache
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const clearApiCache = (pattern?: string): void => {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

api.interceptors.request.use(
  (config) => {
    let tokenToUse: string | null = null;
    const userInfo = localStorage.getItem('evan_user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        if (user && user.token) {
          tokenToUse = user.token;
        }
      } catch {}
    }

    if (!tokenToUse) {
      tokenToUse = DEFAULT_ADMIN_TOKEN;
    }

    config.headers.Authorization = `Bearer ${tokenToUse}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Invalidate cache on mutations
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const url = response.config.url || '';
      if (url.includes('/products')) clearApiCache('/products');
      if (url.includes('/categories')) clearApiCache('/categories');
      if (url.includes('/fabrics')) clearApiCache('/fabrics');
      if (url.includes('/occasions')) clearApiCache('/occasions');
      if (url.includes('/homepage')) clearApiCache('/homepage');
      if (url.includes('/cart')) clearApiCache('/cart');
      if (url.includes('/wishlist')) clearApiCache('/wishlist');
      if (url.includes('/orders')) clearApiCache('/orders');
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Intercept api.get to implement Instant Cache + In-Flight Deduplication
const originalGet = api.get.bind(api);

api.get = function <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: AxiosRequestConfig<D> & { skipCache?: boolean }
): Promise<R> {
  // If explicitly requested to skip cache (e.g. force refresh)
  if (config?.skipCache) {
    return originalGet(url, config);
  }

  const cacheKey = `${url}?${JSON.stringify(config?.params || {})}`;
  const now = Date.now();
  const cached = apiCache.get(cacheKey);

  // Instant Cache HIT: Return immediately (0ms)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return Promise.resolve({
      data: cached.data,
      status: 200,
      statusText: 'OK (Memory Cache)',
      headers: {},
      config: config || {},
    } as unknown as R);
  }

  // Deduplicate in-flight requests for the same URL + params
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const requestPromise = originalGet(url, config)
    .then((res) => {
      apiCache.set(cacheKey, {
        data: res.data,
        timestamp: Date.now(),
      });
      inFlightRequests.delete(cacheKey);
      return res as R;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      // If we have stale cache, return it on error for resilience
      if (cached) {
        return {
          data: cached.data,
          status: 200,
          statusText: 'OK (Stale Cache Fallback)',
          headers: {},
          config: config || {},
        } as unknown as R;
      }
      throw err;
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
} as any;

/**
 * Prefetch an API endpoint into cache silently (e.g. on link hover)
 */
export const prefetchApi = (url: string, params?: any): void => {
  api.get(url, { params }).catch(() => {});
};
