/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/**
 * Modal for confirming user deactivation with optional notes
 */
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface DeactivationModalProps {
  show: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  isLoading?: boolean;
}

const DeactivationModal: React.FC<DeactivationModalProps> = ({
  show,
  userName,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Deactivate User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-danger mb-3">
          <strong>Warning:</strong>
          {' '}
          This will permanently deactivate the user account. This action can be reversed by reactivating the user.
        </div>

        <p className="mb-3">
          <strong>User:</strong>
          {' '}
          {userName}
        </p>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Reason for Deactivation</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Add notes about this deactivation..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Deactivating...' : 'Deactivate User'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeactivationModal;
