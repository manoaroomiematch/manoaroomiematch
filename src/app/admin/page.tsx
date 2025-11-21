'use client';

/* eslint-disable react/no-unknown-property */
/* eslint-disable react/button-has-type */
/**
 * The Admin Home page.
 * Contains sections for User Management, Content Moderation, and Lifestyle Categories with tables.
 * This page provides a simple overview of the admin interface.
 */

import React, { useState } from 'react';
import { Container, Button, Form } from 'react-bootstrap';

import UserManagement, { mockUsers } from '@/components/UserManagementAdmin';
import AdminSection from '@/components/AdminSection';
import LifestyleCategoriesTable, { mockCategories } from '@/components/LifestyleCategoryAdmin';
import ContentModerationTable, { mockFlags } from '@/components/ContentModerationAdmin';
import AdminTable from '@/components/AdminTable';

const AdminPage: React.FC = () => {
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

  /** USER MANAGEMENT FILTERS */
  let filteredUsers = mockUsers.filter((user) => {
    // eslint-disable-next-line max-len
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
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
  let filteredFlags = mockFlags.filter((flag) => {
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
  let filteredCategories = mockCategories.filter((category) => {
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

  return (
    <main>
      <Container className="py-4">
        <h1 className="mb-4">Admin Home</h1>

        {/* USER MANAGEMENT */}
        <AdminSection title="User Management" page={page} totalPages={totalPagesUsers} onPageChange={setPage}>
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <Form.Control
              style={{ maxWidth: '280px' }}
              type="text"
              placeholder="Search users..."
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

            <Button variant="success" className="rounded-pill px-4">
              Add User
            </Button>
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
                <ContentModerationTable key={flag.id} {...flag} />
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
