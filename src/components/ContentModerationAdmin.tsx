/* eslint-disable react/button-has-type */
/**
 * A user management component to display and moderate flagged content.
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';

export interface ContentFlag {
  // eslint-disable-next-line react/no-unused-prop-types
  id: number; // Used as key in parent component
  user: string;
  reason: string;
  date: string;
}

/* Mock data for the admin page (temporary, until Prisma is working) */
export const mockFlags: ContentFlag[] = [
  { id: 1, user: 'Alice Lee', reason: 'Spam', date: '2025-11-19' },
  { id: 2, user: 'Tim Doe', reason: 'Inappropriate content', date: '2025-11-18' },
  { id: 3, user: 'Carol Smith', reason: 'Harassment', date: '2025-11-15' },
  { id: 4, user: 'Joe Johnson', reason: 'Inappropriate content', date: '2025-09-10' },
  { id: 5, user: 'John Doe', reason: 'Spam', date: '2025-10-23' },
  { id: 6, user: 'Pete Peterson', reason: 'Inappropriate content', date: '2025-09-13' },
];

/* Renders a single row for the content moderation table. */
const ContentModerationTable: React.FC<ContentFlag> = ({ user, reason, date }) => (
  <tr>
    <td>{user}</td>
    <td>{reason}</td>
    <td>{date}</td>

    <td className="d-flex gap-2">
      <Button variant="success" size="sm" className="rounded-pill d-flex align-items-center">
        <CheckCircle className="me-1" />
        {' '}
        Resolve
      </Button>

      <Button variant="danger" size="sm" className="rounded-pill d-flex align-items-center">
        <XCircle className="me-1" />
        {' '}
        Deactivate
      </Button>
    </td>
  </tr>
);

export default ContentModerationTable;
