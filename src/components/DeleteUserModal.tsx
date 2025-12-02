/* eslint-disable react/require-default-props */
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DeleteUserModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => Promise<void>;
  userName: string;
  error?: string | null;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ show, onHide, onConfirm, userName, error }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Delete User</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <div className="alert alert-danger">{error}</div>}
      <p>
        Are you sure you want to delete the user
        {' '}
        <strong>{userName}</strong>
        ? This action cannot be undone.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Delete
      </Button>
    </Modal.Footer>
  </Modal>
);

export default DeleteUserModal;
