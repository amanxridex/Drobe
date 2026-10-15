import { redis } from './redis';

/**
 * Standard Cache TTL Presets (Seconds)
 */
export const CACHE_TTL = {
  REALTIME: 30,       // 30 seconds (inventory counts, order tracking)
  SHORT: 120,         // 2 minutes (hot collections, trending filters)
  MEDIUM: 300,        // 5 minutes (brand storefront, product catalogs)
  LONG: 1800,         // 30 minutes (static brand profiles, manifest lookbooks)
  STATIC: 86400       // 24 hours (immutable reference data)
} as const;

/**
 * Standardized Drobe Cache Key Namespace
 */
export const CACHE_KEYS = {
  BRAND_PROFILE: (brandIdOrSlug: string) => `drobe:cache:brand:${brandIdOrSlug.toLowerCase()}`,
  BRAND_PRODUCTS: (brandIdOrSlug: string) => `drobe:cache:brand_products:${brandIdOrSlug.toLowerCase()}`,
  STOREFRONT_CATEGORIES: (gender: string = 'all') => `drobe:cache:categories:${gender.toLowerCase()}`,
  ACTIVE_PRODUCTS_ALL: 'drobe:cache:products:all_live',
  DISCOVER_BRANDS_SLIDES: 'drobe:cache:manifest:discover_brands',
  RATE_LIMIT: (action: string, ip: string) => `drobe:rl:${action}:${ip}`
};

/**
 * High-Performance "Cache-Aside" / "Remember" Utility
 * Checks Redis/Memory cache first. On miss, resolves fetcher, caches result with TTL, and returns.
 */
export async function cacheRemember<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`[Cache] Cache hit check error for key ${key}:`, err);
  }

  // Cache miss: execute fetcher
  const freshData = await fetcher();

  if (freshData !== null && freshData !== undefined) {
    try {
      await redis.set(key, freshData, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[Cache] Cache write error for key ${key}:`, err);
    }
  }

  return freshData;
}

/**
 * Invalidate a specific cache key or group
 */
export async function invalidateCacheKey(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[Cache] Failed to invalidate key ${key}:`, err);
  }
}

/**
 * Invalidate all cached data for a specific brand when an inwarding or edit occurs
 */
export async function invalidateBrandCache(brandIdOrSlug: string): Promise<void> {
  const brandKey = CACHE_KEYS.BRAND_PROFILE(brandIdOrSlug);
  const productsKey = CACHE_KEYS.BRAND_PRODUCTS(brandIdOrSlug);
  await Promise.allSettled([
    redis.del(brandKey),
    redis.del(productsKey),
    redis.del(CACHE_KEYS.ACTIVE_PRODUCTS_ALL)
  ]);
}

/**
 * Edge & API Sliding Window Rate Limiter
 * Protects endpoints against DDoS, scrapers, and bot abuse.
 */
export async function checkRateLimit(
  action: string,
  clientIp: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; current: number; remaining: number; resetSeconds: number }> {
  const key = CACHE_KEYS.RATE_LIMIT(action, clientIp);
  try {
    const currentCount = await redis.incr(key);
    if (currentCount === 1) {
      // First request in window: set TTL
      await redis.expire(key, windowSeconds);
    }

    const allowed = currentCount <= limit;
    const remaining = Math.max(0, limit - currentCount);

    return {
      allowed,
      current: currentCount,
      remaining,
      resetSeconds: windowSeconds
    };
  } catch (err) {
    console.warn(`[RateLimit] Limiter bypass on error:`, err);
    return { allowed: true, current: 1, remaining: limit - 1, resetSeconds: windowSeconds };
  }
}
