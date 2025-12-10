/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/**
 * A user management component to display and moderate flagged content.
 */
import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import { CheckCircle, XCircle, Ban, ArrowClockwise, ChevronDown, ChevronUp } from 'react-bootstrap-icons';

export interface ContentFlag {
  id: number;
  user: string;
  userId?: number;
  reason: string;
  date: string;
  status?: string;
  suspensionCount?: number;
  suspendedUntil?: string;
  onResolve?: (
    flagId: number,
    action: 'resolve' | 'suspend' | 'deactivate' | 'reactivate',
    durationHours?: number,
    notes?: string,
  ) => void;
  onShowHistory?: (userId: number) => void;
}

/* Renders a single row for the content moderation table with expandable history section */
const ContentModerationTable: React.FC<ContentFlag> = ({
  id,
  user,
  userId,
  reason,
  date,
  status = 'pending',
  suspensionCount = 0,
  suspendedUntil,
  onResolve = () => {},
  onShowHistory = () => {},
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const isResolved = status === 'resolved' || status === 'user_deactivated';
  const isSuspended = suspendedUntil && new Date(suspendedUntil) > new Date();
  const isDeactivated = status === 'user_deactivated';

  const handleResolve = () => {
    onResolve(id, 'resolve', undefined, '');
  };

  const handleSuspend = () => {
    // This would normally trigger a modal - for now we'll call the handler
    // The parent component will handle showing the suspension modal
    onResolve(id, 'suspend', 24, 'Auto-suspended');
  };

  const handleDeactivate = () => {
    onResolve(id, 'deactivate', undefined, 'User deactivated by admin');
  };

  const handleReactivate = () => {
    onResolve(id, 'reactivate', undefined, 'User reactivated by admin');
  };

  const getStatusBadge = () => {
    if (isDeactivated) return <span className="badge bg-danger">Deactivated</span>;
    if (isSuspended) return <span className="badge bg-warning text-dark">Suspended</span>;
    if (isResolved) return <span className="badge bg-success">Resolved</span>;
    return <span className="badge bg-secondary">Pending</span>;
  };

  return (
    <>
      <tr>
        <td>{user}</td>
        <td>{reason}</td>
        <td>{date}</td>
        <td>
          <div className="d-flex gap-2 align-items-center">
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="success"
                size="sm"
                className="rounded-pill d-flex align-items-center"
                onClick={handleResolve}
                disabled={isResolved}
              >
                <CheckCircle className="me-1" style={{ fontSize: '0.9rem' }} />
                {' '}
                Resolve
              </Button>

              <Button
                variant="warning"
                size="sm"
                className="rounded-pill d-flex align-items-center"
                onClick={handleSuspend}
                disabled={isDeactivated}
              >
                <Ban className="me-1" style={{ fontSize: '0.9rem' }} />
                {' '}
                Suspend
              </Button>

              <Button
                variant="danger"
                size="sm"
                className="rounded-pill d-flex align-items-center"
                onClick={handleDeactivate}
                disabled={isDeactivated}
              >
                <XCircle className="me-1" style={{ fontSize: '0.9rem' }} />
                {' '}
                Deactivate
              </Button>

              {isDeactivated && (
                <Button
                  variant="info"
                  size="sm"
                  className="rounded-pill d-flex align-items-center"
                  onClick={handleReactivate}
                >
                  <ArrowClockwise className="me-1" style={{ fontSize: '0.9rem' }} />
                  {' '}
                  Reactivate
                </Button>
              )}
            </div>

            {userId && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) onShowHistory(userId);
                }}
                className="d-flex align-items-center"
              >
                {showHistory ? <ChevronUp /> : <ChevronDown />}
              </Button>
            )}
          </div>
          <div className="mt-2">{getStatusBadge()}</div>
          {suspensionCount > 0 && (
            <small className="text-muted d-block mt-1">
              Suspensions:
              {' '}
              {suspensionCount}
            </small>
          )}
        </td>
      </tr>

      {userId && showHistory && (
      <tr>
        <td colSpan={4}>
          <Collapse in={showHistory}>
            <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.25rem' }}>
              <h6 className="mb-3">
                Moderation History for
                {' '}
                {user}
              </h6>
              <div id="history-content">
                {/* History content will be loaded dynamically */}
                <p className="text-muted">Loading history...</p>
              </div>
            </div>
          </Collapse>
        </td>
      </tr>
      )}
    </>
  );
};

export default ContentModerationTable;
