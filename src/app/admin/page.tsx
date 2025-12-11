/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

/* eslint-disable react/no-unknown-property */
/* eslint-disable react/button-has-type */
/**
 * The Admin Home page.
 * Contains sections for User Management, Content Moderation, and Lifestyle Categories with tables.
 * This page provides a simple overview of the admin interface.
 */

import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import UserManagement from '@/components/UserManagementAdmin';
import AdminSection from '@/components/AdminSection';
import LifestyleCategoriesTable from '@/components/LifestyleCategoryAdmin';
import ContentModerationTable from '@/components/ContentModerationAdmin';
import AdminTable from '@/components/AdminTable';
import UserProfileModal from '@/components/UserProfileModal';
import CategoryModal from '@/components/CategoryModal';
import DeleteCategoryModal from '@/components/DeleteCategoryModal';
import DeleteUserModal from '@/components/DeleteUserModal';
import SuspensionModal from '@/components/SuspensionModal';
import DeactivationModal from '@/components/DeactivationModal';
import AdminSidebar from '@/components/AdminSidebar';
import AdminStatisticsCard from '@/components/AdminStatisticsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getFromCache, setCache, clearCache } from '@/lib/adminCache';

// NOTE: All mock data has been removed. This admin page now fetches live data
// from the database via three admin-only API endpoints:
// - GET /api/admin/users - Returns all users with their profile information
// - GET /api/admin/flags - Returns all content moderation flags
// - GET /api/admin/categories - Returns all lifestyle categories with question counts

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Flag {
  id: number;
  user: string;
  userId?: number;
  reportedBy: string;
  reason: string;
  status: string;
  date: string;
  suspensionCount?: number;
  suspendedUntil?: string;
}

interface Category {
  id: number;
  name: string;
  items: number;
  lastUpdated: string;
}

/**
 * Get a time-based greeting based on the current hour
 * @returns greeting string (Good Morning, Good Afternoon, or Good Evening)
 */
function getTimeBasedGreeting(): string {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return 'Good Morning';
  }
  if (currentHour < 18) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
}

const AdminPage: React.FC = () => {
  // New: Tab state for moderation (active vs resolved)
  const [moderationTab, setModerationTab] = useState<'active' | 'resolved'>('active');
  // Modal state for add/delete category
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string>('');
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);

  // Add category handler for modal
  const handleAddCategory = async (name: string) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to add category');
      const { category } = await response.json();
      setCategories((prev) => [
        ...prev,
        {
          id: category.id,
          name: category.name,
          items: 0,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      ]);
      // Clear category cache on add
      clearCache('categories-all');
      setCategoryModalError(null);
    } catch (err) {
      setCategoryModalError('Error adding category.');
      throw err;
    }
  };

  // Delete category handler for modal
  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteCategoryId }),
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategories((prev) => prev.filter((cat) => cat.id !== deleteCategoryId));
      // Clear category cache on delete
      clearCache('categories-all');
      setCategoryModalError(null);
      setShowDeleteCategoryModal(false);
    } catch (err) {
      setCategoryModalError('Error deleting category.');
    }
  };
  // Modal state for user deletion
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>('');
  const [userModalError, setUserModalError] = useState<string | null>(null);

  // Delete user handler for modal
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteUserId }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      // Clear user cache on delete
      clearCache('users-all');
      setUserModalError(null);
      setShowDeleteUserModal(false);
    } catch (err) {
      setUserModalError('Error deleting user.');
    }
  };
  /** View user profile handler - uses pre-fetched user data, then fetches full profile on demand */
  const handleViewUser = async (email: string, userId?: string) => {
    // Attempt to fetch the full profile data
    try {
      const response = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUserProfile(data.profile);
        if (userId) {
          setSelectedUserIdForModal(Number(userId));
        }
      } else {
        setSelectedUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setSelectedUserProfile(null);
    }
    setShowProfileModal(true);
  };
  const { data: session, status } = useSession();
  const router = useRouter();

  /** Data state - fetched from API endpoints instead of hard-coded mock data */
  const [users, setUsers] = useState<User[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [selectedUserIdForModal, setSelectedUserIdForModal] = useState<number | undefined>(undefined);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminPhotoUrl, setAdminPhotoUrl] = useState<string | undefined>(undefined);
  const [adminProfile, setAdminProfile] = useState<{
    firstName?: string;
    lastName?: string;
    bio?: string;
    pronouns?: string;
  }>({});

  /** Check admin access - redirect non-admin users */
  // This provides client-side protection in addition to the server-side
  // API endpoint protection
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.randomKey !== 'ADMIN') {
      router.push('/not-authorized');
    }
  }, [session, status, router]);

  /** Shared filter state */
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userSort, setUserSort] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  /** CONTENT MODERATION FILTERS */
  const [moderationSearch, setModerationSearch] = useState('');
  // Removed reasonFilter as it's no longer used
  const [moderationSort, setModerationSort] = useState('');
  const [moderationPage, setModerationPage] = useState(1);

  /** LIFESTYLE CATEGORIES FILTERS */
  const [categorySearch, setCategorySearch] = useState('');
  const [categorySort, setCategorySort] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);

  /** SUSPENSION AND DEACTIVATION MODALS */
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const [selectedFlagId, setSelectedFlagId] = useState<number | null>(null);
  const [selectedFlagUserName, setSelectedFlagUserName] = useState('');
  const [moderationActionLoading, setModerationActionLoading] = useState(false);
  const [showModerationHistory, setShowModerationHistory] = useState<number | null>(null);

  /** Fetch all users with caching (client-side pagination) */
  const fetchUsers = async (skipCache = false) => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      // Check cache first
      const cacheKey = 'users-all';
      if (!skipCache) {
        const cachedUsers = getFromCache<any>(cacheKey);
        if (cachedUsers) {
          setUsers(cachedUsers.users || []);
          return;
        }
      }

      const response = await fetch('/api/admin/users?limit=1000');
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
      const data = await response.json();
      setUsers(data.users || []);

      // Cache the result
      setCache(cacheKey, data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  /** Fetch all flags with caching (client-side pagination) */
  const fetchFlags = async (skipCache = false) => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      // Check cache first
      const cacheKey = 'flags-all';
      if (!skipCache) {
        const cachedFlags = getFromCache<any>(cacheKey);
        if (cachedFlags) {
          setFlags(cachedFlags.flags || []);
          return;
        }
      }

      const response = await fetch('/api/admin/flags?limit=1000');
      if (!response.ok) throw new Error(`Failed to fetch flags: ${response.statusText}`);
      const data = await response.json();
      setFlags(data.flags || []);

      // Cache the result
      setCache(cacheKey, data);
    } catch (err) {
      console.error('Error fetching flags:', err);
    }
  };

  /** Fetch all categories with caching (client-side pagination) */
  const fetchCategories = async (skipCache = false) => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      // Check cache first
      const cacheKey = 'categories-all';
      if (!skipCache) {
        const cachedCategories = getFromCache<any>(cacheKey);
        if (cachedCategories) {
          setCategories(cachedCategories.categories || []);
          return;
        }
      }

      const response = await fetch('/api/admin/categories?limit=1000');
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
      const data = await response.json();
      setCategories(data.categories || []);

      // Cache the result
      setCache(cacheKey, data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  /** Fetch admin profile and all data on initial load */
  const fetchAdminData = async () => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      setInitialLoading(true);
      // Fetch admin profile
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/profile?email=${encodeURIComponent(session.user.email)}`);
          if (response.ok) {
            const data = await response.json();
            const { profile } = data;
            setAdminPhotoUrl(profile?.photoUrl || undefined);
            setAdminProfile({
              firstName: profile?.firstName || undefined,
              lastName: profile?.lastName || undefined,
              bio: profile?.bio || undefined,
              pronouns: profile?.pronouns || undefined,
            });
          }
        } catch (err) {
          console.error('Error fetching admin profile:', err);
        }
      }
      // Fetch all tables in parallel
      await Promise.all([fetchUsers(), fetchFlags(), fetchCategories()]);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  /** Fetch data from API - replaces all hard-coded mock data */

  // Initial load on component mount
  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  /** Handle flag resolution - updates local state immediately after successful API call */
  // Use string for action to avoid TypeScript narrowing issues in user update logic
  const handleResolveFlag = async (
    flagId: number,
    action: string,
    durationHours?: number,
    notes?: string,
    fromModal?: boolean,
  ) => {
    // For suspend and deactivate, show modals first (unless we're coming from the modal)
    if ((action === 'suspend' || action === 'deactivate') && !fromModal) {
      const flag = flags.find((f) => f.id === flagId);
      if (!flag) return;

      setSelectedFlagId(flagId);
      setSelectedFlagUserName(flag.user);

      if (action === 'suspend') {
        setShowSuspensionModal(true);
      } else {
        setShowDeactivationModal(true);
      }
      return;
    }

    // For resolve, unsuspend, deactivate (via modal), suspend (via modal), reactivate, and other actions
    try {
      setModerationActionLoading(true);
      const body: any = { flagId, action };
      if (durationHours) body.durationHours = durationHours;
      if (notes) body.notes = notes;

      const response = await fetch('/api/admin/resolve-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} flag`);
      }

      const data = await response.json();

      // Update local state for flags
      let newStatus = 'pending';
      if (action === 'resolve' || action === 'unsuspend') newStatus = 'resolved';
      else if (action === 'reactivate') newStatus = 'active';
      else if (action === 'deactivate') newStatus = 'user_deactivated';
      else if (action === 'suspend') newStatus = 'suspended';

      setFlags((prev) => prev.map((flag) => (flag.id === flagId ? { ...flag, status: newStatus } : flag)));

      // Update local state for users if needed
      if (data && data.user && data.user.id) {
        setUsers((prev) => prev.map((u) => {
          if (String(u.id) !== String(data.user.id)) return u;
          if (action === 'suspend') {
            return {
              ...u,
              suspendedUntil: data.user.suspendedUntil,
              suspensionCount: data.user.suspensionCount,
            };
          }
          if (action === 'unsuspend') {
            return {
              ...u,
              suspendedUntil: null,
            };
          }
          if (action === 'deactivate') {
            return {
              ...u,
              active: false,
              suspendedUntil: null,
            };
          }
          if (action === 'reactivate') {
            return {
              ...u,
              active: true,
              suspendedUntil: null,
            };
          }
          return u;
        }));
      }

      // Clear modals
      setShowSuspensionModal(false);
      setShowDeactivationModal(false);
      setSelectedFlagId(null);
      setSelectedFlagUserName('');
    } catch (err) {
      console.error(`Error ${action}ing flag:`, err);
      alert(`Error ${action}ing flag`);
    } finally {
      setModerationActionLoading(false);
    }
  };

  const handleShowModerationHistory = async (userId: number) => {
    if (showModerationHistory === userId) {
      setShowModerationHistory(null);
      return;
    }

    try {
      const response = await fetch(`/api/admin/moderation-history?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      setShowModerationHistory(userId);
    } catch (err) {
      console.error('Error fetching moderation history:', err);
      alert('Failed to load moderation history');
    }
  };

  /** USER MANAGEMENT FILTERS - Client-side filtering and sorting */
  const filteredUsers = users.filter((u) => {
    const nameMatch = u.name.toLowerCase().includes(search.toLowerCase());
    const emailMatch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = search === '' || nameMatch || emailMatch;
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (userSort === 'NameA') return a.name.localeCompare(b.name);
    if (userSort === 'NameZ') return b.name.localeCompare(a.name);
    return 0;
  });

  // Paginate the filtered/sorted results
  const startUser = (page - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startUser, startUser + pageSize);
  const totalUserPages = Math.ceil(sortedUsers.length / pageSize);
  const totalPagesUsers = totalUserPages;
  const shownUsers = paginatedUsers;

  /** CONTENT MODERATION FILTERS - Client-side filtering and sorting */
  const filteredFlags = flags.filter((f) => {
    const matchesSearch = moderationSearch === '' || f.user.toLowerCase().includes(moderationSearch.toLowerCase());
    return matchesSearch;
  });

  const sortedFlags = [...filteredFlags].sort((a, b) => {
    if (moderationSort === 'UserA') return a.user.localeCompare(b.user);
    if (moderationSort === 'UserZ') return b.user.localeCompare(a.user);
    if (moderationSort === 'DateNew') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (moderationSort === 'DateOld') return new Date(a.date).getTime() - new Date(b.date).getTime();
    return 0;
  });

  // Paginate the filtered/sorted results
  const startFlag = (moderationPage - 1) * pageSize;
  const paginatedFlags = sortedFlags.slice(startFlag, startFlag + pageSize);
  const totalFlagPages = Math.ceil(sortedFlags.length / pageSize);
  const totalPagesModeration = totalFlagPages;
  const shownFlags = paginatedFlags;

  // Only show unresolved or resolved flags based on tab
  // Treat suspended and deactivated as resolved for the resolved tab
  const isFlagResolved = (flag: Flag) => flag.status === 'resolved'
    || flag.status === 'user_deactivated'
    || flag.status === 'suspended'
    || (flag.suspendedUntil && new Date(flag.suspendedUntil) > new Date());

  const shownFlagsActive = shownFlags.filter((flag) => !isFlagResolved(flag));
  const shownFlagsResolved = shownFlags.filter((flag) => isFlagResolved(flag));
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = categorySearch === '' || c.name.toLowerCase().includes(categorySearch.toLowerCase());
    return matchesSearch;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (categorySort === 'NameA') return a.name.localeCompare(b.name);
    if (categorySort === 'NameZ') return b.name.localeCompare(a.name);
    if (categorySort === 'ItemsLow') return a.items - b.items;
    if (categorySort === 'ItemsHigh') return b.items - a.items;
    if (categorySort === 'DateNew') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    if (categorySort === 'DateOld') return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
    return 0;
  });

  // Paginate the filtered/sorted results
  const startCategory = (categoryPage - 1) * pageSize;
  const paginatedCategories = sortedCategories.slice(startCategory, startCategory + pageSize);
  const totalCategoryPages = Math.ceil(sortedCategories.length / pageSize);
  const totalPagesCategories = totalCategoryPages;
  const shownCategories = paginatedCategories;

  // Compute admin display name from edited profile if available
  const adminDisplayName = (adminProfile.firstName || adminProfile.lastName)
    ? `${adminProfile.firstName ?? ''} ${adminProfile.lastName ?? ''}`.trim()
    : session?.user?.name || 'Admin';

  const [adminBgColor, setAdminBgColor] = useState<'white' | 'green' | 'blue' | 'red' | 'yellow'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminBgColor');
      if (saved && ['white', 'green', 'blue', 'red', 'yellow'].includes(saved)) {
        return saved as 'white' | 'green' | 'blue' | 'red' | 'yellow';
      }
    }
    return 'white';
  });

  useEffect(() => {
    localStorage.setItem('adminBgColor', adminBgColor);
  }, [adminBgColor]);

  const colorMap = {
    white: {
      bg: 'linear-gradient(120deg, #f8f9fa 60%, #ffffff 100%)',
      banner: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
      stats: ' #a8e063ff',
      statsText: '#246127ff',
    },
    green: {
      bg: 'linear-gradient(120deg, #e8f5e9 60%, #c8e6c9 100%)',
      banner: 'linear-gradient(135deg, #388e3c 0%, #a8e063 100%)',
      stats: '#ace58dff',
      statsText: '#002e02ff',
    },
    blue: {
      bg: 'linear-gradient(120deg, #e3f2fd 60%, #bbdefb 100%)',
      banner: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
      stats: '#7bbdffff',
      statsText: '#002d59ff',
    },
    red: {
      bg: 'linear-gradient(120deg, #ffebee 60%, #ffcdd2 100%)',
      banner: 'linear-gradient(135deg, #c62828 0%, #ff8a80 100%)',
      stats: '#ff8989ff',
      statsText: '#460202ff',
    },
    yellow: {
      bg: 'linear-gradient(120deg, #fffde7 60%, #fff9c4 100%)',
      banner: 'linear-gradient(135deg, #fbc02d 0%, #ffe772ff 100%)',
      stats: '#ffe881ff',
      statsText: '#896711ff',
    },
  };

  if (status === 'loading' || initialLoading) {
    return (
      <main>
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <LoadingSpinner />
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container fluid className="py-4" style={{ background: colorMap[adminBgColor].bg, minHeight: '100vh' }}>
        <div className="d-flex gap-4" style={{ alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ width: 320, minWidth: 280 }}>
            <AdminSidebar
              adminName={adminDisplayName}
              adminEmail={session?.user?.email || ''}
              adminPhotoUrl={adminPhotoUrl}
              adminFirstName={adminProfile.firstName}
              adminLastName={adminProfile.lastName}
              adminBio={adminProfile.bio}
              adminPronouns={adminProfile.pronouns}
              onProfileUpdate={fetchAdminData}
              adminBgColor={adminBgColor}
              setAdminBgColor={setAdminBgColor}
            />
          </div>
          {/* Main Content Banner */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="mb-4 p-5 rounded-4 shadow-sm"
              style={{
                background: colorMap[adminBgColor].banner,
                color: '#fff',
                boxShadow: '0 8px 32px rgba(86, 171, 47, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative background elements */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-10%',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30%',
                  left: '-5%',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  zIndex: 0,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-center" style={{ width: '100%' }}>
                  <div>
                    <h1
                      className="mb-0"
                      style={{
                        color: 'inherit',
                        fontWeight: 700,
                        fontSize: '2.5rem',
                        letterSpacing: 0.5,
                      }}
                    >
                      {getTimeBasedGreeting()}
                      ,
                      {' '}
                      <strong>{adminDisplayName}</strong>
                    </h1>
                    <p style={{ fontSize: '1.05rem', marginTop: '0.5rem', opacity: 0.95, fontWeight: 500 }}>
                      Welcome to your admin dashboard!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-start align-items-center mb-4 gap-3 flex-wrap">
              <AdminStatisticsCard
                totalUsers={users.length}
                totalFlags={flags.length}
                totalCategories={categories.length}
                barColor={colorMap[adminBgColor].stats}
                barText={colorMap[adminBgColor].statsText}
              />
            </div>
            {/* Section styling for all admin tables */}
            <div className="mb-4">
              <AdminSection
                title="User Management"
                page={page}
                totalPages={totalPagesUsers}
                onPageChange={setPage}
                themeColor={adminBgColor}
              >
                <div className="d-flex gap-3 mb-3 flex-wrap align-items-end">
                  <Form.Control
                    style={{ maxWidth: '280px', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001' }}
                    type="text"
                    placeholder="Search user..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                  <Form.Select
                    style={{
                      maxWidth: '180px',
                      borderRadius: '0.75rem',
                      boxShadow: '0 1px 4px #0001',
                    }}
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Filter by role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </Form.Select>
                  <Form.Select
                    style={{
                      maxWidth: '180px',
                      borderRadius: '0.75rem',
                      boxShadow: '0 1px 4px #0001',
                    }}
                    value={userSort}
                    onChange={(e) => {
                      setUserSort(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Sort by</option>
                    <option value="NameA">Name A-Z</option>
                    <option value="NameZ">Name Z-A</option>
                  </Form.Select>
                </div>
                <AdminTable>
                  <thead className="table-light">
                    <tr style={{ background: '#e0ffe7', fontWeight: 600, fontSize: '1.05rem' }}>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownUsers.map((u) => (
                      <UserManagement
                        key={u.id}
                        {...u}
                        onDelete={() => {
                          setDeleteUserId(u.id);
                          setDeleteUserName(u.name);
                          setShowDeleteUserModal(true);
                        }}
                        onView={handleViewUser}
                      />
                    ))}
                  </tbody>
                </AdminTable>
              </AdminSection>
            </div>
            <div className="mb-4">
              <AdminSection
                title="Content Moderation"
                page={moderationPage}
                totalPages={totalPagesModeration}
                onPageChange={setModerationPage}
                themeColor={adminBgColor}
              >
                {/* Moderation Tabs */}
                <div className="d-flex gap-2 mb-3">
                  <Button
                    variant={moderationTab === 'active' ? 'primary' : 'outline-primary'}
                    className="rounded-pill px-4"
                    onClick={() => setModerationTab('active')}
                  >
                    Active Reports
                  </Button>
                  <Button
                    variant={moderationTab === 'resolved' ? 'primary' : 'outline-primary'}
                    className="rounded-pill px-4"
                    onClick={() => setModerationTab('resolved')}
                  >
                    Resolved/Old Reports
                  </Button>
                </div>
                <div className="d-flex gap-3 mb-3 flex-wrap align-items-end">
                  <Form.Control
                    style={{ maxWidth: '280px', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001' }}
                    type="text"
                    placeholder="Search by user..."
                    value={moderationSearch}
                    onChange={(e) => {
                      setModerationSearch(e.target.value);
                      setModerationPage(1);
                    }}
                  />
                  <Form.Select
                    style={{
                      maxWidth: '180px',
                      borderRadius: '0.75rem',
                      boxShadow: '0 1px 4px #0001',
                    }}
                    value={moderationSort}
                    onChange={(e) => {
                      setModerationSort(e.target.value);
                      setModerationPage(1);
                    }}
                  >
                    <option value="">Sort by</option>
                    <option value="DateNew">Date (Newest)</option>
                    <option value="DateOld">Date (Oldest)</option>
                  </Form.Select>
                </div>
                <AdminTable>
                  <thead className="table-light">
                    <tr style={{ background: '#e0ffe7', fontWeight: 600, fontSize: '1.05rem' }}>
                      <th>User</th>
                      <th>Flag Reason</th>
                      <th>Flagged Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(moderationTab === 'active' ? shownFlagsActive : shownFlagsResolved).map((flag) => (
                      <ContentModerationTable
                        key={flag.id}
                        {...flag}
                        onResolve={handleResolveFlag}
                        onShowHistory={handleShowModerationHistory}
                        onViewUser={(userId) => {
                          if (!userId) {
                            // Debug: log missing userId
                            console.warn('No userId for flagged user:', flag);
                            alert('No userId for flagged user. Cannot view profile.');
                            return;
                          }
                          // Find the flagged user in the users list to get their email
                          const flaggedUser = users.find((u) => u.id === String(userId));
                          if (flaggedUser) {
                            handleViewUser(flaggedUser.email, flaggedUser.id);
                          } else {
                            alert('User profile not found.');
                          }
                        }}
                      />
                    ))}
                  </tbody>
                </AdminTable>
              </AdminSection>
            </div>
            <div className="mb-4">
              <AdminSection
                title="Lifestyle Categories"
                page={categoryPage}
                totalPages={totalPagesCategories}
                onPageChange={setCategoryPage}
                themeColor={adminBgColor}
              >
                <div className="d-flex gap-3 mb-3 flex-wrap align-items-end">
                  <Form.Control
                    style={{ maxWidth: '280px', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001' }}
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setCategoryPage(1);
                    }}
                  />
                  <Form.Select
                    style={{
                      maxWidth: '180px',
                      borderRadius: '0.75rem',
                      boxShadow: '0 1px 4px #0001',
                    }}
                    value={categorySort}
                    onChange={(e) => {
                      setCategorySort(e.target.value);
                      setCategoryPage(1);
                    }}
                  >
                    <option value="">Sort by</option>
                    <option value="NameA">Name A-Z</option>
                    <option value="NameZ">Name Z-A</option>
                    <option value="ItemsLow">Items (Low-High)</option>
                    <option value="ItemsHigh">Items (High-Low)</option>
                    <option value="DateNew">Date (Newest)</option>
                    <option value="DateOld">Date (Oldest)</option>
                  </Form.Select>
                  <Button
                    variant="success"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      letterSpacing: 0.5,
                    }}
                    onClick={() => setShowAddCategoryModal(true)}
                  >
                    Add Category
                  </Button>
                </div>
                <AdminTable>
                  <thead className="table-light">
                    <tr style={{ background: '#e0ffe7', fontWeight: 600, fontSize: '1.05rem' }}>
                      <th>Category</th>
                      <th>Items</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownCategories.map((cat) => (
                      <LifestyleCategoriesTable
                        key={cat.id}
                        {...cat}
                        onDelete={() => {
                          setDeleteCategoryId(cat.id);
                          setDeleteCategoryName(cat.name);
                          setShowDeleteCategoryModal(true);
                        }}
                      />
                    ))}
                  </tbody>
                </AdminTable>
              </AdminSection>
            </div>
          </div>
        </div>
      </Container>

      {/* Add Category Modal */}
      <CategoryModal
        show={showAddCategoryModal}
        onHide={() => {
          setShowAddCategoryModal(false);
          setCategoryModalError(null);
        }}
        onSubmit={handleAddCategory}
        error={categoryModalError}
      />

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        show={showDeleteCategoryModal}
        onHide={() => {
          setShowDeleteCategoryModal(false);
          setCategoryModalError(null);
        }}
        onConfirm={handleDeleteCategory}
        categoryName={deleteCategoryName}
        error={categoryModalError}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        show={showDeleteUserModal}
        onHide={() => {
          setShowDeleteUserModal(false);
          setUserModalError(null);
        }}
        onConfirm={handleDeleteUser}
        userName={deleteUserName}
        error={userModalError}
      />

      {/* Keep table-rounded CSS */}
      <style jsx>
        {`
        .table-rounded {
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .table-rounded th,
        .table-rounded td {
          vertical-align: middle;
        }
      `}
      </style>

      {/* User Profile Modal */}
      <UserProfileModal
        profile={selectedUserProfile}
        show={showProfileModal}
        onHide={() => {
          setShowProfileModal(false);
          setSelectedUserProfile(null);
          setSelectedUserIdForModal(undefined);
        }}
        userId={selectedUserIdForModal}
      />

      {/* Suspension Modal */}
      <SuspensionModal
        show={showSuspensionModal}
        userName={selectedFlagUserName}
        onClose={() => {
          setShowSuspensionModal(false);
          setSelectedFlagId(null);
          setSelectedFlagUserName('');
        }}
        onConfirm={(durationHours, notes) => {
          if (selectedFlagId) {
            handleResolveFlag(selectedFlagId, 'suspend', durationHours, notes, true);
          }
        }}
        isLoading={moderationActionLoading}
      />

      {/* Deactivation Modal */}
      <DeactivationModal
        show={showDeactivationModal}
        userName={selectedFlagUserName}
        onClose={() => {
          setShowDeactivationModal(false);
          setSelectedFlagId(null);
          setSelectedFlagUserName('');
        }}
        onConfirm={(notes) => {
          if (selectedFlagId) {
            handleResolveFlag(selectedFlagId, 'deactivate', undefined, notes, true);
          }
        }}
        isLoading={moderationActionLoading}
      />
    </main>
  );
};

export default AdminPage;
