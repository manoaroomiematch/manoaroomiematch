/**
 * Simple reusable admin table wrapper.
 * Keeps styling consistent for all admin sections.
 */
import React from 'react';
import { Table } from 'react-bootstrap';

const AdminTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Table hover className="table-rounded shadow-sm">
    {children}
  </Table>
);

export default AdminTable;
