/**
 * Simple reusable admin table wrapper.
 * Keeps styling consistent for all admin sections.
 */
import React from 'react';
import { Table } from 'react-bootstrap';

const AdminTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <Table hover className="table-rounded shadow-sm" style={{ margin: 0 }}>
      {children}
    </Table>
  </div>
);

export default AdminTable;
