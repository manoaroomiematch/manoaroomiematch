/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface CategoryModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (name: string) => Promise<void>;
  error?: string | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ show, onHide, onSubmit, error }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Category name is required');
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit(name.trim());
      setName('');
      onHide();
    } catch (err) {
      setLocalError('Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {localError && <Alert variant="danger">{localError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="categoryName">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={submitting}
            />
          </Form.Group>
          <div className="mt-3 d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryModal;
