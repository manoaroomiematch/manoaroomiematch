/**
 * A reusable admin section wrapper with title, controls row, table, and pagination.
 * Used by User Management, Content Moderation, and Lifestyle Categories.
 */

'use client';

/* eslint-disable react/require-default-props */
import React from 'react';
import { Button } from 'react-bootstrap';

interface AdminSectionProps {
  title: string;
  children: React.ReactNode; // filters + table
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  themeColor?: 'white' | 'green' | 'blue' | 'red' | 'yellow';
}

const AdminSection: React.FC<AdminSectionProps> = ({
  title,
  children,
  page,
  totalPages,
  onPageChange,
  themeColor = 'white',
}) => {
  const colorStyles = {
    white: { primary: '#56ab2f', light: '#e8f5e9' },
    green: { primary: '#388e3c', light: '#c8e6c9' },
    blue: { primary: '#1976d2', light: '#bbdefb' },
    red: { primary: '#c62828', light: '#ffcdd2' },
    yellow: { primary: '#fbc02d', light: '#fff9c4' },
  };

  const buttonStyle = colorStyles[themeColor];

  return (
    <section className="mb-5">
      <h2 className="mb-3">{title}</h2>

      {children}

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-2 gap-2">
        <Button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          style={{
            backgroundColor: page === 1 ? '#ccc' : buttonStyle.light,
            color: '#333',
            border: `1px solid ${buttonStyle.primary}`,
          }}
        >
          Previous
        </Button>

        {[...Array(totalPages)].map((_, i) => (
          <Button
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            onClick={() => onPageChange(i + 1)}
            style={{
              backgroundColor: page === i + 1 ? buttonStyle.primary : buttonStyle.light,
              color: page === i + 1 ? '#fff' : '#333',
              border: `1px solid ${buttonStyle.primary}`,
            }}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{
            backgroundColor: page === totalPages ? '#ccc' : buttonStyle.light,
            color: '#333',
            border: `1px solid ${buttonStyle.primary}`,
          }}
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default AdminSection;
