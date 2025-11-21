/* eslint-disable react/button-has-type */
/**
 * A user management component to display lifestyle categories in a table.
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import AdminTable from '@/components/AdminTable';

export interface Category {
  id: number;
  name: string;
  items: number;
  lastUpdated: string;
}

/* Mock data for admin page (temporary, until Prisma is working) */
export const mockCategories: Category[] = [
  { id: 1, name: 'Fitness', items: 12, lastUpdated: '2025-11-19' },
  { id: 2, name: 'Cooking', items: 8, lastUpdated: '2025-11-18' },
  { id: 3, name: 'Travel', items: 5, lastUpdated: '2025-11-17' },
];

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/* Renders the lifestyle categories table rows. */
const LifestyleCategoriesTable: React.FC = () => (
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
      {mockCategories.map((cat) => (
        <tr key={cat.id}>
          <td>{capitalize(cat.name)}</td>
          <td>{cat.items}</td>
          <td>{cat.lastUpdated}</td>

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
  </AdminTable>
);

export default LifestyleCategoriesTable;
