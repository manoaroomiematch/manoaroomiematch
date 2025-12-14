'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge, Modal, Button } from 'react-bootstrap';
import { BellFill, X } from 'react-bootstrap-icons';

interface Notification {
  id: number;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Styles for text overflow with ellipsis
  const notificationTextStyle = {
    wordBreak: 'break-word' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  };

  // Fetch notifications on component mount and periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          const unread = (data.notifications || []).filter(
            (n: Notification) => !n.is_read,
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    if (!showDropdown) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line no-return-assign
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(
          notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    // Prevent triggering the mark as read handler
    e.stopPropagation();

    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Remove notification from local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find((n) => n.id === notificationId);
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="position-relative" style={{ display: 'inline-block' }} ref={panelRef}>
        <button
          type="button"
          className="btn btn-link p-0 text-dark text-decoration-none"
          onClick={() => {
            setShowDropdown(!showDropdown);
          }}
          style={{ border: 'none', background: 'none' }}
          aria-label="Notifications"
        >
          <span className="position-relative">
            <BellFill size={20} />
            {unreadCount > 0 && (
              <Badge
                bg="danger"
                pill
                className="position-absolute"
                style={{
                  top: '-8px',
                  right: '-8px',
                  fontSize: '0.65rem',
                  minWidth: '18px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </span>
        </button>

        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: 'min(280px, calc(100vw - 2rem))',
              maxHeight: '500px',
              overflowY: 'auto',
              zIndex: 1000,
              marginTop: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {notifications.length === 0 ? (
              <div className="p-3 text-muted text-center">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    handleMarkAsRead(notification.id);
                    setSelectedNotification(notification);
                  }}
                  className={`btn btn-link text-start w-100 p-3 ${!notification.is_read ? 'fw-bold bg-light' : ''}`}
                  style={{
                    borderBottom: '1px solid #e9ecef',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p
                        className="mb-1 small text-dark"
                        style={notificationTextStyle}
                      >
                        {notification.content}
                      </p>
                      <small className="text-muted">
                        {formatDate(notification.created_at)}
                      </small>
                    </div>
                    <div className="d-flex gap-2 align-items-start" style={{ flexShrink: 0 }}>
                      {!notification.is_read && (
                        <span
                          className="badge bg-primary rounded-circle"
                          style={{
                            width: '8px',
                            height: '8px',
                            marginTop: '4px',
                          }}
                        />
                      )}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-danger"
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          marginTop: '2px',
                        }}
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <Modal
        show={selectedNotification !== null}
        onHide={() => setSelectedNotification(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedNotification?.content}</p>
          <small className="text-muted">
            {selectedNotification && formatDate(selectedNotification.created_at)}
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSelectedNotification(null)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationsPanel;
