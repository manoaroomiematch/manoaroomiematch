/* eslint-disable react/require-default-props */
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DeleteCategoryModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
  error?: string | null;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({ show, onHide, onConfirm, categoryName, error }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Delete Category</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <div className="alert alert-danger">{error}</div>}
      <p>
        Are you sure you want to delete the category
        <strong>{categoryName}</strong>
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

export default DeleteCategoryModal;
