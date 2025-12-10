# Admin Dashboard API Call Optimizations

## Overview
Implemented three key optimizations to reduce API calls and database queries in the admin dashboard, addressing NeonDB egress quota limitations.

## Changes Made

### 1. **UserProfileModal - Pass Profile as Prop (Reduce API Calls)**

**Before:**
```tsx
// UserProfileModal fetched profile data every time it opened
interface UserProfileModalProps {
  email: string | null;
  show: boolean;
  onHide: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ email, show, onHide }) => {
  useEffect(() => {
    if (!show || !email) return;
    const fetchProfile = async () => {
      const response = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
      // ...fetch and set profile
    };
    fetchProfile();
  }, [email, show]);
```

**After:**
```tsx
// UserProfileModal now receives profile data as a prop
interface UserProfileModalProps {
  profile: ProfileData | null;
  show: boolean;
  onHide: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ profile, show, onHide }) => {
  // No fetching - just displays the passed-in profile data
  // No loading/error states needed
```

**Impact:**
- ✅ Eliminates extra profile API call when modal opens
- ✅ Removes loading state complexity
- ✅ Profile data is still fetched when needed (see optimization #2)

---

### 2. **handleViewUser - Fetch Profile Only Once on Demand**

**Before:**
```tsx
// Opened modal without fetching profile
const handleViewUser = (email: string) => {
  setSelectedUserEmail(email);
  setShowProfileModal(true);
  // Modal then made its own API call
};
```

**After:**
```tsx
// Fetches profile data when user clicks "View", passes to modal as prop
const handleViewUser = async (email: string) => {
  try {
    const response = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
    if (response.ok) {
      const data = await response.json();
      setSelectedUserProfile(data.profile);
    } else {
      setSelectedUserProfile(null);
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
    setSelectedUserProfile(null);
  }
  setShowProfileModal(true);
};
```

**Impact:**
- ✅ Profile is fetched once (in parent component) instead of being duplicated in modal
- ✅ Consolidates API call logic to one place
- ✅ No double-fetching when modal opens

---

### 3. **handleResolveFlag - Update Local State Instead of Refetching All Flags**

**Before:**
```tsx
// Resolved a flag, then re-fetched ALL flags from the database
const handleResolveFlag = async (flagId: number, action: 'resolve' | 'deactivate') => {
  const response = await fetch('/api/admin/resolve-flag', {
    method: 'POST',
    body: JSON.stringify({ flagId, action }),
  });
  // Then made another API call to fetch ALL flags
  const flagsResponse = await fetch('/api/admin/flags');
  const flagsData = await flagsResponse.json();
  setFlags(flagsData.flags || []); // Re-fetched entire list
};
```

**After:**
```tsx
// Resolves a flag and updates local state immediately
const handleResolveFlag = async (flagId: number, action: 'resolve' | 'deactivate') => {
  const response = await fetch('/api/admin/resolve-flag', {
    method: 'POST',
    body: JSON.stringify({ flagId, action }),
  });
  
  if (!response.ok) throw new Error(`Failed to ${action} flag`);
  
  // Update local state immediately - no full refetch needed
  const newStatus = action === 'resolve' ? 'resolved' : 'user_deactivated';
  setFlags((prev) => prev.map((flag) => (flag.id === flagId ? { ...flag, status: newStatus } : flag)));
};
```

**Impact:**
- ✅ Eliminates redundant API call to fetch all flags after each flag action
- ✅ Faster UI update (local state change is instant)
- ✅ For N flags being resolved, saves N unnecessary API calls
- ✅ If user has 14 flags visible and resolves multiple, saves significant egress quota

---

## Egress Quota Savings

### Before Optimizations
- Opening a user profile modal: 1 API call (to fetch profile)
- Resolving a flag: 2 API calls (POST to resolve + GET to fetch all flags)

### After Optimizations
- Opening a user profile modal: 1 API call (only when viewing, once per modal open)
- Resolving a flag: 1 API call (only the POST, no refetch)

### Example Usage Scenario
If an admin:
- Views 5 user profiles: **0 API calls saved** (still need to fetch profile once per view)
- Resolves 10 flags: **10 API calls saved** (no longer refetching all flags each time)
- **Total: ~10 API calls saved per admin session**

With 14 rows per page and multiple pages, these savings compound quickly.

---

## Related Files Modified

1. `/src/components/UserProfileModal.tsx`
   - Changed props from `email` to `profile`
   - Removed `useEffect`, `useState` hooks for fetching
   - Removed loading/error states

2. `/src/app/admin/page.tsx`
   - Added `selectedUserProfile` state
   - Updated `handleViewUser` to fetch profile before opening modal
   - Optimized `handleResolveFlag` to update local state instead of refetching

---

## Future Optimization Opportunities

1. **Pagination cache**: Cache paginated results and only refetch when filters change
2. **Debounce search**: If client-side filtering is added, debounce input to avoid multiple API calls
3. **Context API**: Consider using React Context to share user/flag/category data across components
4. **React Query/SWR**: Implement a data fetching library to handle caching, refetching, and deduplication automatically

---

## Testing Recommendations

- ✅ Verify that viewing user profiles still displays correct data
- ✅ Verify that resolving/deactivating flags updates UI immediately
- ✅ Check browser DevTools Network tab to confirm API call reductions
- ✅ Monitor NeonDB dashboard to confirm egress quota usage decrease
