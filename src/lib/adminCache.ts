/**
 * Admin Dashboard Caching System
 * Provides local caching for admin data to reduce database egress
 *
 * Cache Strategy:
 * - Cache is stored in localStorage with timestamp
 * - Default TTL (time-to-live) is 5 minutes
 * - Can be manually invalidated with refresh buttons
 * - Only used by admin components
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'admin-cache-';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get cached data if it exists and is not expired
 */
export function getFromCache<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const { data, timestamp }: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - timestamp > ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
}

/**
 * Store data in cache with timestamp
 */
export function setCache<T>(key: string, data: T): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error);
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
  }
}

/**
 * Clear all admin cache entries
 */
export function clearAllAdminCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all admin cache:', error);
  }
}

/**
 * Check if a cache entry exists and is valid
 */
export function isCacheValid(key: string, ttl: number = DEFAULT_TTL): boolean {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return false;

    const { timestamp }: CacheEntry<any> = JSON.parse(cached);
    const now = Date.now();

    return now - timestamp <= ttl;
  } catch (error) {
    return false;
  }
}

/**
 * Get cache metadata (timestamp, age, TTL)
 */
export function getCacheMetadata(key: string, ttl: number = DEFAULT_TTL) {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const { timestamp }: CacheEntry<any> = JSON.parse(cached);
    const now = Date.now();
    const age = now - timestamp;
    const isValid = age <= ttl;
    const timeRemaining = Math.max(0, ttl - age);

    return {
      timestamp,
      age,
      ttl,
      isValid,
      timeRemaining,
      expiresIn: `${Math.round(timeRemaining / 1000)}s`,
    };
  } catch (error) {
    return null;
  }
}
