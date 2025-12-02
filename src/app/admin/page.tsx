'use client';

/* eslint-disable react/no-unknown-property */
/* eslint-disable react/button-has-type */
/**
 * The Admin Home page.
 * Contains sections for User Management, Content Moderation, and Lifestyle Categories with tables.
 * This page provides a simple overview of the admin interface.
 */

import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Alert } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import UserManagement from '@/components/UserManagementAdmin';
import AdminSection from '@/components/AdminSection';
import LifestyleCategoriesTable from '@/components/LifestyleCategoryAdmin';
import ContentModerationTable from '@/components/ContentModerationAdmin';
import AdminTable from '@/components/AdminTable';
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
  activity: string;
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

const AdminPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  /** Data state - fetched from API endpoints instead of hard-coded mock data */
  const [users, setUsers] = useState<User[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const pageSize = 5;

  /** CONTENT MODERATION FILTERS */
  const [moderationSearch, setModerationSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [moderationSort, setModerationSort] = useState('');
  const [moderationPage, setModerationPage] = useState(1);

  /** LIFESTYLE CATEGORIES FILTERS */
  const [categorySearch, setCategorySearch] = useState('');
  const [categorySort, setCategorySort] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);

  /** Fetch data from API - replaces all hard-coded mock data */
  const fetchAdminData = async () => {
    // Only fetch data if user is authenticated and is admin
    if (status !== 'authenticated' || session?.user?.randomKey !== 'ADMIN') {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch users from database (replaces mockUsers)
      const usersResponse = await fetch('/api/admin/users');
      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
      }
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);

      // Fetch flags from database (replaces mockFlags)
      const flagsResponse = await fetch('/api/admin/flags');
      if (!flagsResponse.ok) {
        throw new Error(`Failed to fetch flags: ${flagsResponse.statusText}`);
      }
      const flagsData = await flagsResponse.json();
      setFlags(flagsData.flags || []);

      // Fetch categories from database (replaces mockCategories)
      const categoriesResponse = await fetch('/api/admin/categories');
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /** Initial data load on component mount */
  useEffect(() => {
    fetchAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

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
      setError(`Failed to ${action} flag. Please try again.`);
    }
  };

  /** USER MANAGEMENT FILTERS */
  let filteredUsers = users.filter((user) => {
    // Support searching by first or last name, as well as full name and email
    const searchLower = search.toLowerCase();
    const [firstName, ...rest] = user.name.split(' ');
    const lastName = rest.length > 0 ? rest[rest.length - 1] : '';
    const matchesSearch = user.name.toLowerCase().includes(searchLower)
      || user.email.toLowerCase().includes(searchLower)
      || firstName.toLowerCase().includes(searchLower)
      || lastName.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Apply sorting for users
  if (userSort === 'NameA') {
    filteredUsers = [...filteredUsers].sort((a, b) => a.name.localeCompare(b.name));
  } else if (userSort === 'NameZ') {
    filteredUsers = [...filteredUsers].sort((a, b) => b.name.localeCompare(a.name));
  }

  const totalPagesUsers = Math.ceil(filteredUsers.length / pageSize);
  const shownUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  /** CONTENT MODERATION FILTERS */
  let filteredFlags = flags.filter((flag) => {
    const matchesSearch = flag.user.toLowerCase().includes(moderationSearch.toLowerCase());
    const matchesReason = reasonFilter ? flag.reason === reasonFilter : true;
    return matchesSearch && matchesReason;
  });

  // Apply sorting
  if (moderationSort === 'UserA') {
    filteredFlags = [...filteredFlags].sort((a, b) => a.user.localeCompare(b.user));
  } else if (moderationSort === 'UserZ') {
    filteredFlags = [...filteredFlags].sort((a, b) => b.user.localeCompare(a.user));
  } else if (moderationSort === 'DateNew') {
    filteredFlags = [...filteredFlags].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (moderationSort === 'DateOld') {
    filteredFlags = [...filteredFlags].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const totalPagesModeration = Math.ceil(filteredFlags.length / pageSize);
  const shownFlags = filteredFlags.slice((moderationPage - 1) * pageSize, moderationPage * pageSize);

  /** LIFESTYLE CATEGORIES FILTERS */
  let filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(categorySearch.toLowerCase());
    return matchesSearch;
  });

  // Apply sorting for categories
  if (categorySort === 'NameA') {
    filteredCategories = [...filteredCategories].sort((a, b) => a.name.localeCompare(b.name));
  } else if (categorySort === 'NameZ') {
    filteredCategories = [...filteredCategories].sort((a, b) => b.name.localeCompare(a.name));
  } else if (categorySort === 'ItemsLow') {
    filteredCategories = [...filteredCategories].sort((a, b) => a.items - b.items);
  } else if (categorySort === 'ItemsHigh') {
    filteredCategories = [...filteredCategories].sort((a, b) => b.items - a.items);
  } else if (categorySort === 'DateNew') {
    // eslint-disable-next-line max-len
    filteredCategories = [...filteredCategories].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  } else if (categorySort === 'DateOld') {
    // eslint-disable-next-line max-len
    filteredCategories = [...filteredCategories].sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
  }

  const totalPagesCategories = Math.ceil(filteredCategories.length / pageSize);
  const shownCategories = filteredCategories.slice((categoryPage - 1) * pageSize, categoryPage * pageSize);

  if (loading) {
    return (
      <main>
        <Container className="py-4 text-center">
          <LoadingSpinner />
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Admin Home</h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchAdminData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <strong>Error:</strong>
            {' '}
            {error}
          </Alert>
        )}

        {/* USER MANAGEMENT */}
        <AdminSection title="User Management" page={page} totalPages={totalPagesUsers} onPageChange={setPage}>
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <Form.Control
              style={{ maxWidth: '280px' }}
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Form.Select
              style={{ maxWidth: '180px' }}
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
              style={{ maxWidth: '180px' }}
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
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {shownUsers.map((u) => (
                <UserManagement key={u.id} {...u} />
              ))}
            </tbody>
          </AdminTable>
        </AdminSection>

        {/* CONTENT MODERATION */}
        <AdminSection
          title="Content Moderation"
          page={moderationPage}
          totalPages={totalPagesModeration}
          onPageChange={setModerationPage}
        >
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <Form.Control
              style={{ maxWidth: '280px' }}
              type="text"
              placeholder="Search by user..."
              value={moderationSearch}
              onChange={(e) => {
                setModerationSearch(e.target.value);
                setModerationPage(1);
              }}
            />

            <Form.Select
              style={{ maxWidth: '200px' }}
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
              style={{ maxWidth: '180px' }}
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
          </div>

          <AdminTable>
            <thead className="table-light">
              <tr>
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

        {/* LIFESTYLE CATEGORIES */}
        <AdminSection
          title="Lifestyle Categories"
          page={categoryPage}
          totalPages={totalPagesCategories}
          onPageChange={setCategoryPage}
        >
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <Form.Control
              style={{ maxWidth: '280px' }}
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setCategoryPage(1);
              }}
            />

            <Form.Select
              style={{ maxWidth: '180px' }}
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

            <Button variant="success" className="rounded-pill px-4">
              Add Category
            </Button>
          </div>

          <AdminTable>
            <thead className="table-light">
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {shownCategories.map((cat) => (
                <LifestyleCategoriesTable key={cat.id} {...cat} />
              ))}
            </tbody>
          </AdminTable>
        </AdminSection>
      </Container>

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
    </main>
  );
};

export default AdminPage;
