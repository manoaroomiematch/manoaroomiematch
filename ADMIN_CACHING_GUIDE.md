# Admin Dashboard Caching System

## Overview

A **client-side caching system** has been implemented specifically for the admin dashboard to reduce egress usage on your NeonDB free tier. This system caches API responses in localStorage with automatic expiration and manual invalidation.

**Important:** This caching system is isolated to the admin dashboard ONLY. It does not affect other pages or components.

## How It Works

### Cache Strategy

1. **On Page Load/Data Fetch:**
   - System checks if cached data exists in localStorage
   - If valid (not expired), uses cached data instantly
   - If expired or missing, fetches fresh data from API
   - Stores response in cache with timestamp

2. **Cache Expiration:**
   - Default TTL (Time-To-Live): **5 minutes**
   - After 5 minutes, cache is considered stale
   - Next fetch request will get fresh data from API

3. **Manual Cache Invalidation:**
   - "Refresh All Data" button: Clears ALL admin cache and refetches everything
   - Individual "Refresh" buttons: Skip cache for that specific table only
   - Add/Delete operations: Automatically clear relevant cache entries

## Files Added

### 1. `/src/lib/adminCache.ts`
Core caching utility functions:
- `getFromCache<T>(key, ttl)` - Retrieve cached data if valid
- `setCache<T>(key, data)` - Store data in cache with timestamp
- `clearCache(key)` - Clear specific cache entry
- `clearAllAdminCache()` - Clear all admin cache entries
- `isCacheValid(key, ttl)` - Check if cache is still fresh
- `getCacheMetadata(key, ttl)` - Get cache info (age, expiration time, etc.)

### 2. `/src/hooks/useAdminDataWithCache.ts`
Custom React hook for data fetching with caching:
```tsx
const { data, loading, error, refetch, isCached } = useAdminDataWithCache(
  'users',
  '/api/admin/users?page=1&limit=10',
  { ttl: 5 * 60 * 1000, skipCache: false }
);
```

**Properties:**
- `data`: The fetched/cached data
- `loading`: Is a request in progress
- `error`: Any fetch error
- `refetch()`: Force refresh, bypassing cache
- `isCached`: Boolean indicating if current data came from cache

### 3. Updated `/src/app/admin/page.tsx`
Integrated caching into all admin data fetches:

#### Modified Functions:
- `fetchUsers(skipCache?)` - Fetch users with optional cache skip
- `fetchFlags(skipCache?)` - Fetch flags with optional cache skip
- `fetchCategories(skipCache?)` - Fetch categories with optional cache skip

#### Updated Handlers:
- `handleAddCategory()` - Clears category cache after adding
- `handleDeleteCategory()` - Clears category cache after deleting
- `handleDeleteUser()` - Clears user cache after deleting

#### Updated Buttons:
- "Refresh All Data" - Clears all cache before fetching
- Individual "Refresh" buttons - Each calls fetch with `skipCache=true`

## Egress Reduction Benefits

### Scenario: Admin uses dashboard for 30 minutes

**Without Caching:**
- Page load: 3 API calls (users, flags, categories)
- Switch pages 4 times: 3 × 4 = 12 API calls
- View 3 user profiles: 3 API calls
- Resolve 5 flags: 5 API calls (+ 5 refetches of all flags = 10 more)
- **Total: 28 API calls = ~28 MB transferred** (depending on data size)

**With Caching (5-min TTL):**
- Page load: 3 API calls (users, flags, categories)
- Switch pages within 5 min: 0 API calls (from cache)
- View 3 user profiles: 3 API calls (not cached, needed for full details)
- Resolve 5 flags: 5 API calls (local state update, NO refetch of all flags)
- **Total: 11 API calls = ~11 MB transferred**
- **Savings: ~17 API calls per admin session** (61% reduction)

## Usage Examples

### Example 1: Using the Cache in a New Component

```tsx
import { getFromCache, setCache, clearCache } from '@/lib/adminCache';

// Get cached users
const cachedUsers = getFromCache('users-page-1');

// Store something in cache
setCache('users-page-2', { users: [...], pagination: {...} });

// Clear cache for a specific key
clearCache('users-page-1');
```

### Example 2: Using the Custom Hook

```tsx
import useAdminDataWithCache from '@/hooks/useAdminDataWithCache';

const MyAdminComponent = () => {
  const { data, loading, error, refetch, isCached } = useAdminDataWithCache(
    'my-data',
    '/api/my-endpoint',
    { ttl: 5 * 60 * 1000 }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>{isCached ? 'From Cache' : 'Fresh Data'}</p>
      <button onClick={refetch}>Force Refresh</button>
      {/* render data */}
    </div>
  );
};
```

## Configuration

### Cache TTL
Default TTL is **5 minutes**. To change globally:

1. Edit `/src/lib/adminCache.ts`:
```tsx
const DEFAULT_TTL = 10 * 60 * 1000; // Change to 10 minutes
```

2. Or specify per-fetch in `/src/app/admin/page.tsx`:
```tsx
const cacheKey = `users-page-${page}`;
const cachedUsers = getFromCache(cacheKey, 10 * 60 * 1000); // 10 minute TTL
```

### Disabling Cache for Specific Fetches
```tsx
const cachedUsers = getFromCache(cacheKey);
if (!DISABLE_CACHE) {
  // Only use cache if enabled
}
```

## Caching Prefix

All admin cache entries use the prefix `admin-cache-` in localStorage to prevent conflicts:
- `admin-cache-users-page-1`
- `admin-cache-flags-page-1`
- `admin-cache-categories-page-1`

## Cache Invalidation Strategy

The system automatically invalidates cache when:

1. **Data Mutation Occurs:**
   - Add category → clears `categories-page-X`
   - Delete category → clears `categories-page-X`
   - Delete user → clears `users-page-X`
   - Resolve flag → updates local state (no refetch needed)

2. **Manual Refresh:**
   - Individual "Refresh" button → `skipCache=true`
   - "Refresh All Data" button → clears all cache + refetches

3. **Cache Expiration:**
   - Automatic after TTL expires (5 minutes default)

## Browser Developer Tools

Check cache in DevTools:
1. Open DevTools → Application → Local Storage
2. Look for keys starting with `admin-cache-`
3. Check timestamp and data in the stored JSON

Example cache entry:
```json
{
  "data": {
    "users": [...],
    "pagination": {...}
  },
  "timestamp": 1733805600000
}
```

## Important Notes

- **Admin Dashboard Only:** Cache is isolated to admin routes and components
- **No Breaking Changes:** Other pages/components are completely unaffected
- **SessionStorage Not Used:** All cache is in localStorage for persistence across tab refreshes
- **Client-Side Only:** Cache is processed in the browser, not on the server
- **Data Freshness:** 5-minute TTL balances egress savings with data freshness

## Future Enhancements

Potential improvements for later:
1. **IndexedDB:** For larger cache storage (>5MB limit of localStorage)
2. **Background Sync:** Refresh cache in background before expiration
3. **Selective Caching:** Only cache specific tables, not profile modals
4. **Cache Analytics:** Track hits/misses to optimize TTL
5. **React Query/SWR:** More sophisticated caching library integration

## Troubleshooting

### Cache Not Working?
- Check localStorage is enabled in browser
- Verify cache keys in DevTools Application tab
- Check browser console for errors

### Data Seems Stale?
- Click "Refresh All Data" to force fresh fetch
- Reduce TTL in adminCache.ts
- Check timestamps in localStorage

### Cache Taking Too Much Space?
- Reduce TTL to clear stale entries faster
- Use `clearAllAdminCache()` to manually clear all
- Monitor localStorage usage in DevTools

---

**Last Updated:** December 9, 2025  
**Caching System Version:** 1.0  
**Default TTL:** 5 minutes
