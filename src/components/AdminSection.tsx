/**
 * A reusable admin section wrapper with title, controls row, table, and pagination.
 * Used by User Management, Content Moderation, and Lifestyle Categories.
 */

'use client';

import React from 'react';
import { Button } from 'react-bootstrap';

interface AdminSectionProps {
  title: string;
  children: React.ReactNode; // filters + table
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const AdminSection: React.FC<AdminSectionProps> = ({
  title,
  children,
  page,
  totalPages,
  onPageChange,
}) => (
  <section className="mb-5">
    <h2 className="mb-3">{title}</h2>

    {children}

    {/* Pagination */}
    <div className="d-flex justify-content-end mt-2 gap-2">
      <Button variant="light" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>

      {[...Array(totalPages)].map((_, i) => (
        <Button
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          variant={page === i + 1 ? 'primary' : 'outline-primary'}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </Button>
      ))}

      <Button
        variant="light"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  </section>
);

export default AdminSection;
