/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/**
 * A user management component to display user information in a table row.
 */
import React, { useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { Trash, Flag } from 'react-bootstrap-icons';

export interface UserManagementProps {
  id: string;
  name: string;
  email: string;
  role: string;
  onDelete: (id: string) => void;
  onView: (email: string, userId?: string) => void;
  onFlagged?: () => void;
}

/* Renders a single row in the User Management table. See admin/page.tsx. */
const UserManagement: React.FC<UserManagementProps> = ({ id, name, email, role, onDelete, onView, onFlagged }) => {
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [flagSuccess, setFlagSuccess] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState(false);
  const [currentRole, setCurrentRole] = useState(role);

  const handleFlagUser = async () => {
    if (!flagReason.trim()) {
      setFlagError('Please provide a reason for the flag');
      return;
    }

    setFlagLoading(true);
    setFlagError(null);

    try {
      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: Number(id),
          reason: flagReason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFlagError(data.error || 'Failed to flag user');
        return;
      }

      setFlagSuccess(true);
      setFlagReason('');
      // Notify parent component that a user was flagged so it can refresh the flags list
      if (onFlagged) {
        onFlagged();
      }
      setTimeout(() => {
        setShowFlagModal(false);
        setFlagSuccess(false);
      }, 1500);
    } catch (err) {
      setFlagError('An error occurred while flagging the user');
      console.error('Flag error:', err);
    } finally {
      setFlagLoading(false);
    }
  };

  const handleChangeRole = async () => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setRoleLoading(true);
    setRoleError(null);

    try {
      const response = await fetch('/api/admin/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(id),
          newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRoleError(data.error || 'Failed to change user role');
        return;
      }

      setRoleSuccess(true);
      setCurrentRole(newRole);
      setTimeout(() => {
        setShowRoleModal(false);
        setRoleSuccess(false);
      }, 1500);
    } catch (err) {
      setRoleError('An error occurred while changing the user role');
      console.error('Role change error:', err);
    } finally {
      setRoleLoading(false);
    }
  };

  // Compute button text to avoid nested ternary
  const roleButtonText = (() => {
    if (roleLoading) return 'Changing...';
    return currentRole === 'ADMIN' ? 'Demote to USER' : 'Promote to ADMIN';
  })();

  return (
    <>
      <tr>
        <td>{name}</td>
        <td>{email}</td>
        <td>{role}</td>
        <td className="d-flex gap-2">
          {/* View Profile Button that navigates to the user's profile page */}
          <Button
            variant="primary"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={() => onView(email, id)}
          >
            View
          </Button>
          {/* Flag User Button to report user */}
          <Button
            variant="outline-danger"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={() => setShowFlagModal(true)}
            title="Flag this user for moderation review"
          >
            <Flag className="me-1" style={{ fontSize: '0.9rem' }} />
            Flag
          </Button>
          {/* Change Role Button */}
          <Button
            variant={currentRole === 'ADMIN' ? 'warning' : 'outline-warning'}
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={() => setShowRoleModal(true)}
            title={`Change role to ${currentRole === 'ADMIN' ? 'USER' : 'ADMIN'}`}
          >
            {currentRole === 'ADMIN' ? 'Demote' : 'Promote'}
          </Button>
          {/* Delete User Button that triggers user deletion */}
          <Button
            variant="danger"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={() => onDelete(id)}
          >
            <Trash className="me-1" />
            {' '}
            Delete
          </Button>
        </td>
      </tr>
      {/* Modals rendered outside the table row for accessibility and spacing consistency */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>User:</strong>
            {' '}
            {name}
          </p>
          <p className="mb-3">
            <strong>Current Role:</strong>
            {' '}
            {currentRole}
          </p>
          {roleSuccess ? (
            <Alert variant="success">
              User role updated to
              {' '}
              {currentRole}
              successfully.
            </Alert>
          ) : (
            <>
              {roleError && <Alert variant="danger">{roleError}</Alert>}
              <Alert variant="info">
                {currentRole === 'ADMIN' ? (
                  <>
                    This will demote the user from
                    {' '}
                    <strong>ADMIN</strong>
                    {' '}
                    to
                    {' '}
                    <strong>USER</strong>
                    .
                    They will no longer be able to access the admin panel.
                  </>
                ) : (
                  <>
                    This will promote the user from
                    {' '}
                    <strong>USER</strong>
                    {' '}
                    to
                    {' '}
                    <strong>ADMIN</strong>
                    .
                    They will gain full admin access.
                  </>
                )}
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowRoleModal(false);
              setRoleError(null);
              setRoleSuccess(false);
            }}
            disabled={roleLoading}
          >
            Cancel
          </Button>
          {!roleSuccess && (
            <Button
              variant={currentRole === 'ADMIN' ? 'warning' : 'info'}
              onClick={handleChangeRole}
              disabled={roleLoading}
            >
              {roleButtonText}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={showFlagModal} onHide={() => setShowFlagModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Flag User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>User:</strong>
            {' '}
            {name}
          </p>
          {flagSuccess ? (
            <Alert variant="success">
              User flagged successfully and will be added to content moderation.
            </Alert>
          ) : (
            <>
              {flagError && <Alert variant="danger">{flagError}</Alert>}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Flag Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe why you're flagging this user..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  disabled={flagLoading}
                />
                <Form.Text className="text-muted d-block mt-1">
                  Be specific about the issue.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowFlagModal(false);
              setFlagReason('');
              setFlagError(null);
              setFlagSuccess(false);
            }}
            disabled={flagLoading}
          >
            Close
          </Button>
          {!flagSuccess && (
            <Button
              variant="danger"
              onClick={handleFlagUser}
              disabled={flagLoading || !flagReason.trim()}
            >
              {flagLoading ? 'Flagging...' : 'Flag User'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagement;
