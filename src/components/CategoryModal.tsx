/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface CategoryModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  error?: string | null;
  category?: { id: number; name: string; description: string } | null;
  isEditing?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  show,
  onHide,
  onSubmit,
  error,
  category,
  isEditing = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      if (category && isEditing) {
        setName(category.name);
        setDescription(category.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setLocalError(null);
    }
  }, [show, category, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Category name is required');
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit(name.trim(), description.trim());
      setName('');
      setDescription('');
      onHide();
    } catch (err) {
      setLocalError(isEditing ? 'Failed to update category' : 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (submitting) return 'Updating...';
    return isEditing ? 'Update Category' : 'Add Category';
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Category' : 'Add Category'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {localError && <Alert variant="danger">{localError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="categoryName" className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={submitting}
              placeholder="e.g., Sleep Habits"
            />
          </Form.Group>
          <Form.Group controlId="categoryDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              placeholder="Brief description of this category..."
            />
            <Form.Text className="d-block mt-2 text-muted">
              <small>
                <strong>Tip:</strong>
                {' '}
                You can add clickable links using markdown syntax:
                <br />
                <code>[Link Text](https://example.com)</code>
                {' '}
                or plain URLs like
                {' '}
                <code>https://example.com</code>
              </small>
            </Form.Text>
          </Form.Group>
          <div className="mt-4 d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={submitting}>
              {getButtonText()}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryModal;
