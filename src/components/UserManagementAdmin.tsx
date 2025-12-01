/* eslint-disable react/button-has-type */
/**
 * A user management component to display user information in a table row.
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

export interface UserManagementProps {
  name: string;
  email: string;
  role: string;
  activity: string;
}

/* Renders a single row in the User Management table. See admin/page.tsx. */
const UserManagement: React.FC<UserManagementProps> = ({ name, email, role, activity }) => (
  <tr>
    <td>{name}</td>
    <td>{email}</td>
    <td>{role}</td>
    <td>{activity}</td>
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
);

export default UserManagement;
