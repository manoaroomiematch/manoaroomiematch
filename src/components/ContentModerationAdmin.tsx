/* eslint-disable max-len */
/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/**
 * A user management component to display and moderate flagged content.
 */
import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import { CheckCircle, XCircle, Ban, ArrowClockwise, ChevronDown, ChevronUp } from 'react-bootstrap-icons';

export interface ContentFlag {
  onViewUser?: (userId: number, userName: string) => void;
  id: number;
  user: string;
  userId?: number;
  reason: string;
  date: string;
  status?: string;
  suspensionCount?: number;
  suspendedUntil?: string;
  active?: boolean;
  onResolve?: (
    flagId: number,
    action: 'resolve' | 'suspend' | 'unsuspend' | 'deactivate' | 'reactivate',
    durationHours?: number,
    notes?: string,
  ) => void;
  onShowHistory?: (userId: number) => void;
}

interface ModerationHistoryAction {
  id: number;
  action: string;
  durationHours?: number;
  notes?: string;
  date: string;
  flagId?: number;
  adminName: string;
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
  active = true,
  onResolve = () => {},
  onShowHistory = () => {},
  onViewUser = () => {},
}) => {
  // Unsuspend handler
  const handleUnsuspend = () => {
    onResolve(id, 'unsuspend', undefined, 'User unsuspended by admin');
  };
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<ModerationHistoryAction[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const isSuspended = status === 'suspended' || (suspendedUntil && new Date(suspendedUntil) > new Date());
  const isDeactivated = !active || status === 'user_deactivated';
  const isResolved = status === 'resolved';

  // Debug logging
  React.useEffect(() => {
    if (isSuspended || isDeactivated) {
      console.log(
        `Flag ${id} for ${user}: status=${status}, suspended=${isSuspended}, deactivated=${isDeactivated}`,
      );
    }
  }, [id, user, status, suspendedUntil, isSuspended, isDeactivated]);

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
          <div className="d-flex flex-column gap-2">
            {/* Main Actions Row - View, Resolve, and Status */}
            <div className="d-flex gap-2 flex-wrap align-items-center">
              {userId && (
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-pill d-flex align-items-center"
                  onClick={() => onViewUser(userId, user)}
                  disabled={isResolved}
                >
                  View
                </Button>
              )}
              <Button
                variant="success"
                size="sm"
                className="rounded-pill d-flex align-items-center"
                onClick={handleResolve}
                disabled={isResolved || isSuspended || isDeactivated}
                title={isSuspended || isDeactivated ? 'User is under active moderation - unsuspend or reactivate first' : 'Mark this report as resolved'}
              >
                <CheckCircle className="me-1" style={{ fontSize: '0.9rem' }} />
                Resolve
              </Button>

              {/* Conditional Moderation Buttons - Replace each other based on state */}
              {!isSuspended && !isDeactivated && (
                <>
                  <Button
                    variant="warning"
                    size="sm"
                    className="rounded-pill d-flex align-items-center"
                    onClick={handleSuspend}
                    disabled={isResolved}
                    title="Temporarily suspend this user"
                  >
                    <Ban className="me-1" style={{ fontSize: '0.9rem' }} />
                    Suspend
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="rounded-pill d-flex align-items-center"
                    onClick={handleDeactivate}
                    disabled={isResolved}
                    title="Permanently deactivate this user"
                  >
                    <XCircle className="me-1" style={{ fontSize: '0.9rem' }} />
                    Deactivate
                  </Button>
                </>
              )}

              {isSuspended && !isDeactivated && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-pill d-flex align-items-center"
                  onClick={handleUnsuspend}
                  disabled={isResolved}
                  title="Remove suspension from this user"
                >
                  <ArrowClockwise className="me-1" style={{ fontSize: '0.9rem' }} />
                  Unsuspend
                </Button>
              )}

              {isDeactivated && (
                <Button
                  variant="info"
                  size="sm"
                  className="rounded-pill d-flex align-items-center"
                  onClick={handleReactivate}
                  disabled={isResolved}
                  title="Reactivate this user"
                >
                  <ArrowClockwise className="me-1" style={{ fontSize: '0.9rem' }} />
                  Reactivate
                </Button>
              )}

              {/* Status Badge and Info */}
              <div className="d-flex gap-2 align-items-center ms-auto">
                {getStatusBadge()}
              </div>
            </div>

            {/* History Row - Utility section */}
            {userId && (
              <div className="d-flex gap-2 align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={async () => {
                    if (showHistory) {
                      setShowHistory(false);
                    } else {
                      setShowHistory(true);
                      // Only fetch if not already fetched
                      // Set loading and fetched flags immediately to prevent race condition
                      // from multiple rapid clicks on the History button
                      if (!historyFetched) {
                        setHistoryLoading(true);
                        setHistoryFetched(true); // Set BEFORE fetch to prevent duplicate requests
                        try {
                          const response = await fetch(`/api/admin/moderation-history?userId=${userId}`);
                          if (response.ok) {
                            const data = await response.json();
                            console.log('History data received:', data);
                            setHistoryData(data.history || []);
                          } else {
                            console.error('Failed to fetch history:', response.statusText);
                            setHistoryData([]);
                          }
                        } catch (err) {
                          console.error('Error fetching history:', err);
                          setHistoryData([]);
                        } finally {
                          setHistoryLoading(false);
                        }
                      }
                    }
                    onShowHistory(userId);
                  }}
                  className="d-flex align-items-center"
                  title="View moderation history"
                >
                  {showHistory ? <ChevronUp /> : <ChevronDown />}
                  {' '}
                  History
                </Button>
                {suspensionCount > 0 && (
                  <small className="text-muted ms-auto">
                    {suspensionCount}
                    {' '}
                    suspension
                    {suspensionCount !== 1 ? 's' : ''}
                  </small>
                )}
              </div>
            )}
          </div>
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
                {historyLoading && (
                  <p className="text-muted">Loading history...</p>
                )}
                {!historyLoading && historyData && historyData.length > 0 && (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {historyData.map((action) => (
                      <div key={action.id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <strong className="text-capitalize">{action.action}</strong>
                          <small className="text-muted">{action.date}</small>
                        </div>
                        <small className="text-muted">
                          By:
                          {' '}
                          {action.adminName}
                        </small>
                        {action.durationHours && (
                          <div>
                            <small className="text-muted">
                              Duration:
                              {' '}
                              {action.durationHours}
                              {' '}
                              hours
                            </small>
                          </div>
                        )}
                        {action.notes && (
                          <div>
                            <small className="text-secondary">
                              Notes:
                              {' '}
                              {action.notes}
                            </small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!historyLoading && (!historyData || historyData.length === 0) && (
                  <p className="text-muted">No moderation history found.</p>
                )}
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
