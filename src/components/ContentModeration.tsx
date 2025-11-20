/* eslint-disable react/button-has-type */
/**
 * A user management component to display and moderate flagged content.
 */
import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';

export interface ContentFlag {
  id: number;
  user: string;
  reason: string;
  date: string;
}

export const mockFlags: ContentFlag[] = [
  { id: 1, user: 'Alice Lee', reason: 'Spam', date: '2025-11-19' },
  { id: 2, user: 'Tim Doe', reason: 'Inappropriate content', date: '2025-11-18' },
  { id: 3, user: 'Carol Smith', reason: 'Harassment', date: '2025-11-15' },
  { id: 4, user: 'Joe Johnson', reason: 'Inappropriate content', date: '2025-09-10' },
  { id: 5, user: 'John Doe', reason: 'Spam', date: '2025-10-23' },
  { id: 6, user: 'Pete Peterson', reason: 'Inappropriate content', date: '2025-09-13' },
];

const ContentModerationTable: React.FC = () => (
  <Table hover className="table-rounded shadow-sm">
    <thead className="table-light">
      <tr>
        <th>User</th>
        <th>Flag Reason</th>
        <th>Flagged Date</th>
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
              <CheckCircle className="me-1" />
              {' '}
              Approve
            </Button>
            <Button variant="danger" size="sm" className="rounded-pill d-flex align-items-center">
              <XCircle className="me-1" />
              {' '}
              Reject
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default ContentModerationTable;
