/* eslint-disable react/button-has-type */
/**
 * A user management component to display user information in a table row.
 */
import React, { Key } from 'react';
import { Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

export interface UserManagementProps {
  // eslint-disable-next-line react/no-unused-prop-types
  id: Key | null | undefined;
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

// Mock data for the admin page (temporary, until Prisma is working)
export const mockUsers: UserManagementProps[] = [
  { id: '1', name: 'Alice Lee', email: 'alice@hawaii.edu', role: 'ADMIN', activity: 'Online' },
  { id: '2', name: 'Bob Jones', email: 'bob@hawaii.edu', role: 'USER', activity: 'Last seen 2h ago' },
  { id: '3', name: 'Carol Smith', email: 'carol@hawaii.edu', role: 'USER', activity: 'Offline' },
  { id: '4', name: 'Tom Kim', email: 'tom@hawaii.edu', role: 'ADMIN', activity: 'Last seen 1h ago' },
  { id: '5', name: 'Bill Miller', email: 'bill@hawaii.edu', role: 'USER', activity: 'Online' },
];

export default UserManagement;
