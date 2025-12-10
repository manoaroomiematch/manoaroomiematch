/**
 * Custom Hook: useAdminDataWithCache
 * Provides caching for admin API calls with automatic cache invalidation
 *
 * Usage:
 * const { data, loading, error, refetch } = useAdminDataWithCache(
 *   'users',
 *   `/api/admin/users?page=1&limit=10`,
 *   5 * 60 * 1000 // 5 minutes
 * );
 */

import { useState, useEffect } from 'react';
import { getFromCache, setCache, clearCache, isCacheValid } from '@/lib/adminCache';

interface UseAdminDataWithCacheOptions {
  ttl?: number; // Cache time-to-live in milliseconds
  skipCache?: boolean; // Skip cache and always fetch fresh
}

interface UseAdminDataWithCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

export default function useAdminDataWithCache<T>(
  cacheKey: string,
  url: string,
  options: UseAdminDataWithCacheOptions = {},
): UseAdminDataWithCacheResult<T> {
  const { ttl = 5 * 60 * 1000, skipCache = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    // Check cache first if not skipping and not forcing refresh
    if (!skipCache && !forceRefresh && isCacheValid(cacheKey, ttl)) {
      const cachedData = getFromCache<T>(cacheKey, ttl);
      if (cachedData) {
        setData(cachedData);
        setIsCached(true);
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setCache(cacheKey, result);
      setIsCached(false);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      console.error(`Error fetching data from ${url}:`, errorObj);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, cacheKey]);

  const refetch = async () => {
    clearCache(cacheKey);
    await fetchData(true);
  };

  return {
    data,
    loading,
    error,
    refetch,
    isCached,
  };
}
