/* eslint-disable react/button-has-type */
/**
 * A user management component to display user information in a table row.
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

export interface UserManagementProps {
  id: string;
  name: string;
  email: string;
  role: string;
  activity: string;
  onDelete: (id: string) => void;
}

/* Renders a single row in the User Management table. See admin/page.tsx. */
const UserManagement: React.FC<UserManagementProps> = ({ id, name, email, role, activity, onDelete }) => (
  <tr>
    <td>{name}</td>
    <td>{email}</td>
    <td>{role}</td>
    <td>{activity}</td>
    <td className="d-flex gap-2">
      {/* View Profile Button that navigates to the user's profile page */}
      <Button
        variant="info"
        size="sm"
        className="rounded-pill d-flex align-items-center"
        href={`/profile/${encodeURIComponent(id)}`}
      >
        View
      </Button>
      {/* Delete User Button that triggers user deletion */}
      <Button
        variant="danger"
        size="sm"
        className="rounded-pill d-flex align-items-center"
        onClick={() => onDelete(id)}
      >
        <Trash className="me-1" />
        {' '}
        Delete
      </Button>
    </td>
  </tr>
);

export default UserManagement;
