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
import AdminSidebar from '@/components/AdminSidebar';
import AdminStatisticsCard from '@/components/AdminStatisticsCard';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  reportedBy: string;
  reason: string;
  status: string;
  date: string;
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
      setUserModalError(null);
      setShowDeleteUserModal(false);
    } catch (err) {
      setUserModalError('Error deleting user.');
    }
  };
  /** View user profile handler */
  const handleViewUser = (email: string) => {
    setSelectedUserEmail(email);
    setShowProfileModal(true);
  };
  const { data: session, status } = useSession();
  const router = useRouter();

  /** Data state - fetched from API endpoints instead of hard-coded mock data */
  const [users, setUsers] = useState<User[]>([]);
  const [usersPagination, setUsersPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [flags, setFlags] = useState<Flag[]>([]);
  const [flagsPagination, setFlagsPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesPagination, setCategoriesPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
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
  const [reasonFilter, setReasonFilter] = useState('');
  const [moderationSort, setModerationSort] = useState('');
  const [moderationPage, setModerationPage] = useState(1);

  /** LIFESTYLE CATEGORIES FILTERS */
  const [categorySearch, setCategorySearch] = useState('');
  const [categorySort, setCategorySort] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);

  /** Fetch users for the current page */
  const fetchUsers = async () => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      setUsersLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=${pageSize}`);
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
      const data = await response.json();
      setUsers(data.users || []);
      setUsersPagination(data.pagination || { total: 0, page: 1, limit: pageSize, pages: 1 });
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  /** Fetch flags for the current page */
  const fetchFlags = async () => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      setFlagsLoading(true);
      const response = await fetch(`/api/admin/flags?page=${moderationPage}&limit=${pageSize}`);
      if (!response.ok) throw new Error(`Failed to fetch flags: ${response.statusText}`);
      const data = await response.json();
      setFlags(data.flags || []);
      setFlagsPagination(data.pagination || { total: 0, page: 1, limit: pageSize, pages: 1 });
    } catch (err) {
      console.error('Error fetching flags:', err);
    } finally {
      setFlagsLoading(false);
    }
  };

  /** Fetch categories for the current page */
  const fetchCategories = async () => {
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') return;
    try {
      setCategoriesLoading(true);
      const response = await fetch(`/api/admin/categories?page=${categoryPage}&limit=${pageSize}`);
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
      const data = await response.json();
      setCategories(data.categories || []);
      setCategoriesPagination(data.pagination || { total: 0, page: 1, limit: pageSize, pages: 1 });
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
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

  // Initial load on component mount and when profile changes
  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, showProfileModal]);

  // Fetch users when user page changes
  useEffect(() => {
    if (!initialLoading) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Fetch flags when moderation page changes
  useEffect(() => {
    if (!initialLoading) fetchFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moderationPage]);

  // Fetch categories when category page changes
  useEffect(() => {
    if (!initialLoading) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryPage]);

  /** Handle flag resolution - calls API endpoint to update flag status */
  // This function is passed to ContentModerationTable components to handle
  // resolve/deactivate button clicks
  const handleResolveFlag = async (flagId: number, action: 'resolve' | 'deactivate') => {
    try {
      const response = await fetch('/api/admin/resolve-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flagId, action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} flag`);
      }

      // Refresh flags data to show updated status
      const flagsResponse = await fetch('/api/admin/flags');
      const flagsData = await flagsResponse.json();
      setFlags(flagsData.flags || []);
    } catch (err) {
      console.error(`Error ${action}ing flag:`, err);
    }
  };

  /** USER MANAGEMENT FILTERS */
  // Note: Filtering and sorting now handled server-side via API pagination
  // keeping filter state for UI but not actively filtering/sorting locally
  const totalPagesUsers = usersPagination.pages;
  const shownUsers = users;

  /** CONTENT MODERATION FILTERS */
  // Note: Filtering and sorting now handled server-side via API pagination
  const totalPagesModeration = flagsPagination.pages;
  const shownFlags = flags;

  /** LIFESTYLE CATEGORIES FILTERS */
  // Note: Filtering and sorting now handled server-side via API pagination
  const totalPagesCategories = categoriesPagination.pages;
  const shownCategories = categories;

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
          {/* Main Content */}
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
            <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
              <button
                type="button"
                className="btn btn-primary shadow-sm px-4 py-2 rounded-pill"
                style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: 0.5 }}
                onClick={fetchAdminData}
              >
                Refresh All Data
              </button>
              <AdminStatisticsCard
                totalUsers={usersPagination.total}
                totalFlags={flagsPagination.total}
                totalCategories={categoriesPagination.total}
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
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill"
                    style={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      border: 'none',
                    }}
                    onClick={fetchUsers}
                    disabled={usersLoading}
                  >
                    {usersLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
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
                    style={{ maxWidth: '200px', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001' }}
                    value={reasonFilter}
                    onChange={(e) => {
                      setReasonFilter(e.target.value);
                      setModerationPage(1);
                    }}
                  >
                    <option value="">Filter by reason</option>
                    <option value="Spam">Spam</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Harassment">Harassment</option>
                  </Form.Select>
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
                    <option value="UserA">User A-Z</option>
                    <option value="UserZ">User Z-A</option>
                    <option value="DateNew">Date (Newest)</option>
                    <option value="DateOld">Date (Oldest)</option>
                  </Form.Select>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill"
                    style={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      border: 'none',
                    }}
                    onClick={fetchFlags}
                    disabled={flagsLoading}
                  >
                    {flagsLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
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
                    {shownFlags.map((flag) => (
                      <ContentModerationTable key={flag.id} {...flag} onResolve={handleResolveFlag} />
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
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill"
                    style={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      border: 'none',
                    }}
                    onClick={fetchCategories}
                    disabled={categoriesLoading}
                  >
                    {categoriesLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
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
        email={selectedUserEmail}
        show={showProfileModal}
        onHide={() => {
          setShowProfileModal(false);
          fetchAdminData();
        }}
      />
    </main>
  );
};

export default AdminPage;
