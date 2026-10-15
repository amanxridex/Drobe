import { Redis } from '@upstash/redis';

/**
 * Resilient In-Memory LRU & TTL Cache
 * Used whenever Redis credentials are not configured (e.g. local dev, offline tests)
 */
class InMemoryCacheStore {
  private store = new Map<string, { value: string; expiresAt: number | null }>();
  private maxEntries = 1000;

  constructor() {
    // Background prune of expired keys every 60 seconds
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.pruneExpired(), 60000);
    }
  }

  private pruneExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return entry.value as unknown as T;
    }
  }

  async set(key: string, value: any, opts?: { ex?: number }): Promise<'OK'> {
    // Evict oldest if limit exceeded
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    const expiresAt = opts?.ex ? Date.now() + opts.ex * 1000 : null;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.store.set(key, { value: serialized, expiresAt });
    return 'OK';
  }

  async del(keys: string | string[]): Promise<number> {
    const keyList = Array.isArray(keys) ? keys : [keys];
    let deleted = 0;
    for (const k of keyList) {
      if (this.store.delete(k)) deleted++;
    }
    return deleted;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get<number>(key);
    const nextVal = (typeof current === 'number' && !isNaN(current)) ? current + 1 : 1;
    await this.set(key, nextVal);
    return nextVal;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  clear(): void {
    this.store.clear();
  }
}

// Global in-memory fallback singleton
const memoryStore = new InMemoryCacheStore();

let upstashClient: Redis | null = null;
let isConfiguredWithUpstash = false;

// Initialize Upstash Redis if environment credentials exist
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (upstashUrl && upstashToken && upstashUrl.startsWith('https://')) {
  try {
    upstashClient = new Redis({
      url: upstashUrl,
      token: upstashToken
    });
    isConfiguredWithUpstash = true;
    console.log('[Redis] Connected to Upstash Redis at Edge.');
  } catch (err) {
    console.warn('[Redis] Failed to initialize Upstash Redis, falling back to In-Memory cache:', err);
    upstashClient = null;
  }
} else {
  // Silent fallback to in-memory store in dev
}

/**
 * Unified Resilient Redis Interface
 */
export const redis = {
  isConfigured(): boolean {
    return isConfiguredWithUpstash && upstashClient !== null;
  },

  getMode(): 'upstash-redis' | 'in-memory' {
    return this.isConfigured() ? 'upstash-redis' : 'in-memory';
  },

  async get<T = any>(key: string): Promise<T | null> {
    if (this.isConfigured() && upstashClient) {
      try {
        const val = await upstashClient.get<T>(key);
        return val ?? null;
      } catch (err) {
        console.warn(`[Redis] GET failed for key "${key}", falling back to memory store:`, err);
        return memoryStore.get<T>(key);
      }
    }
    return memoryStore.get<T>(key);
  },

  async set(key: string, value: any, opts?: { ex?: number }): Promise<'OK'> {
    if (this.isConfigured() && upstashClient) {
      try {
        if (opts?.ex) {
          await upstashClient.set(key, value, { ex: opts.ex });
        } else {
          await upstashClient.set(key, value);
        }
        return 'OK';
      } catch (err) {
        console.warn(`[Redis] SET failed for key "${key}", writing to memory store:`, err);
        return memoryStore.set(key, value, opts);
      }
    }
    return memoryStore.set(key, value, opts);
  },

  async del(keys: string | string[]): Promise<number> {
    if (this.isConfigured() && upstashClient) {
      try {
        const keyList = Array.isArray(keys) ? keys : [keys];
        if (keyList.length === 0) return 0;
        return await upstashClient.del(...keyList);
      } catch (err) {
        console.warn(`[Redis] DEL failed, operating on memory store:`, err);
        return memoryStore.del(keys);
      }
    }
    return memoryStore.del(keys);
  },

  async incr(key: string): Promise<number> {
    if (this.isConfigured() && upstashClient) {
      try {
        return await upstashClient.incr(key);
      } catch (err) {
        return memoryStore.incr(key);
      }
    }
    return memoryStore.incr(key);
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (this.isConfigured() && upstashClient) {
      try {
        return await upstashClient.expire(key, seconds);
      } catch (err) {
        return memoryStore.expire(key, seconds);
      }
    }
    return memoryStore.expire(key, seconds);
  }
};
