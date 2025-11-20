/* eslint-disable react/no-unknown-property */
/* eslint-disable react/button-has-type */
/**
 * The Admin Home page.
 * Contains sections for User Management, Content Moderation, and Lifestyle Categories with tables.
 * This page provides a simple overview of the admin interface.
 */

'use client';

import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { mockUsers } from '@/components/UserManagement';

const AdminPage: React.FC = () => (
  <main>
    <Container className="py-4">
      <h1 className="mb-4">Admin Home</h1>

      {/* User Management Section */}
      <section className="mb-5">
        <h2 className="mb-3">User Management</h2>

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
            {mockUsers.map((user) => (
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

export default AdminPage;
