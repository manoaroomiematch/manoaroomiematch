/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/**
 * A user management component to display and moderate flagged content.
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';

export interface ContentFlag {
  id: number;
  user: string;
  reason: string;
  date: string;
  status?: string;
  onResolve?: (flagId: number, action: 'resolve' | 'deactivate') => void;
}

/* Renders a single row for the content moderation table. */
const ContentModerationTable: React.FC<ContentFlag> = ({
  id,
  user,
  reason,
  date,
  status = 'pending',
  onResolve = () => {},
}) => {
  const isResolved = status === 'resolved' || status === 'user_deactivated';

  return (
    <tr>
      <td>{user}</td>
      <td>{reason}</td>
      <td>{date}</td>

      <td className="d-flex gap-2">
        <Button
          variant="success"
          size="sm"
          className="rounded-pill d-flex align-items-center"
          onClick={() => onResolve(id, 'resolve')}
          disabled={isResolved}
        >
          <CheckCircle className="me-1" />
          {' '}
          {status === 'resolved' ? 'Resolved' : 'Resolve'}
        </Button>

        <Button
          variant="danger"
          size="sm"
          className="rounded-pill d-flex align-items-center"
          onClick={() => onResolve(id, 'deactivate')}
          disabled={isResolved}
        >
          <XCircle className="me-1" />
          {' '}
          {status === 'user_deactivated' ? 'Deactivated' : 'Deactivate'}
        </Button>
      </td>
    </tr>
  );
};

export default ContentModerationTable;
