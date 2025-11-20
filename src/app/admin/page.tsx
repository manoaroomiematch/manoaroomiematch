/* eslint-disable react/no-unknown-property */
/* eslint-disable react/button-has-type */
/**
 * The Admin Home page.
 * Contains sections for User Management, Content Moderation, and Lifestyle Categories with tables.
 * This page provides a simple overview of the admin interface.
 */

'use client';

import React, { useState } from 'react';
import { Container, Table, Button, Form } from 'react-bootstrap';
import { Check, Eye, PencilSquare, Trash, X } from 'react-bootstrap-icons';
import { mockUsers } from '@/components/UserManagement';
import { mockFlags } from '@/components/ContentModeration';

const AdminPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredUsers = mockUsers.filter((user) => {
    // eslint-disable-next-line max-len
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesActivity = activityFilter ? user.activity === activityFilter : true;
    return matchesSearch && matchesRole && matchesActivity;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const shownUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main>
      <Container className="py-4">
        <h1 className="mb-4">Admin Home</h1>

        {/* User Management Section */}
        <section className="mb-5">
          <h2 className="mb-3">User Management</h2>

          {/* Search + Filters */}
          <div className="d-flex gap-3 mb-3 align-items-center flex-wrap">
            <Form.Control
              style={{ maxWidth: '280px' }}
              type="text"
              placeholder="Search users by name or email..."
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
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </Form.Select>

            <Form.Select
              style={{ maxWidth: '180px' }}
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Sort by</option>
              <option value="NameA">Name A-Z</option>
              <option value="NameZ">Name Z-A</option>
            </Form.Select>
            {/* Right side: Add User button */}
            <Button variant="success" className="rounded-pill px-4">
              Add User
            </Button>
          </div>
          {/* User Management Table */}
          <Table hover className="table-rounded shadow-sm">
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
              {shownUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.activity}</td>
                  <td className="d-flex gap-2">
                    <Button variant="primary" size="sm" className="rounded-pill d-flex align-items-center">
                      <PencilSquare className="me-1" />
                      {' '}
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" className="rounded-pill d-flex align-items-center">
                      <Trash className="me-1" />
                      {' '}
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-end mt-2 gap-2">
            <Button variant="light" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Button key={i} variant={page === i + 1 ? 'primary' : 'outline-primary'} onClick={() => setPage(i + 1)}>
                {i + 1}
              </Button>
            ))}

            <Button variant="light" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </section>
        {/* Content Moderation Section */}
        <section className="mb-5">
          <h2 className="mb-3">Content Moderation</h2>

          {/* Search + Filters */}
          <div className="d-flex gap-3 mb-3 align-items-center flex-wrap">
            <Form.Control
              style={{ maxWidth: '280px' }}
              type="text"
              placeholder="Search content by user or keyword..."
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
              <option value="">Filter by date</option>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </Form.Select>

            <Form.Select
              style={{ maxWidth: '180px' }}
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Sort by</option>
              <option value="NameA">Reason A-Z</option>
              <option value="NameZ">Reason Z-A</option>
            </Form.Select>
          </div>
          {/* Content Moderation Table */}
          <Table hover className="table-rounded shadow-sm">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Reason Flagged</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockFlags.map((flag) => (
                <tr key={flag.id}>
                  <td>{flag.user}</td>
                  <td>{flag.reason}</td>
                  <td>{flag.date}</td>
                  <td className="d-flex gap-2">
                    <Button variant="success" size="sm" className="rounded-pill d-flex align-items-center">
                      <Eye className="me-1" />
                      {' '}
                    </Button>
                    <Button variant="primary" size="sm" className="rounded-pill d-flex align-items-center">
                      <Check className="me-1" />
                      {' '}
                    </Button>
                    <Button variant="danger" size="sm" className="rounded-pill d-flex align-items-center">
                      <X className="me-1" />
                      {' '}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-end mt-2 gap-2">
            <Button variant="light" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Button key={i} variant={page === i + 1 ? 'primary' : 'outline-primary'} onClick={() => setPage(i + 1)}>
                {i + 1}
              </Button>
            ))}

            <Button variant="light" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </section>
      </Container>

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
