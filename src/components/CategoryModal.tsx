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
  const [learnMore, setLearnMore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Helper to extract Learn More link from description
  function extractLearnMore(desc: string): { desc: string; link: string } {
    const learnMoreRegex = /\n?\[Learn More\]\((https?:\/\/[^)]+)\)/i;
    const match = desc.match(learnMoreRegex);
    if (match) {
      return {
        desc: desc.replace(learnMoreRegex, '').trim(),
        link: match[1],
      };
    }
    return { desc, link: '' };
  }

  useEffect(() => {
    if (show) {
      if (category && isEditing) {
        setName(category.name);
        const { desc, link } = extractLearnMore(category.description || '');
        setDescription(desc);
        setLearnMore(link);
      } else {
        setName('');
        setDescription('');
        setLearnMore('');
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
    let fullDescription = description.trim();
    if (learnMore.trim()) {
      // Remove any existing Learn More link and append the new one
      fullDescription = fullDescription.replace(/\n?\[Learn More\]\((https?:\/\/[^)]+)\)/i, '').trim();
      fullDescription += `\n[Learn More](${learnMore.trim()})`;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit(name.trim(), fullDescription);
      setName('');
      setDescription('');
      setLearnMore('');
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
              placeholder="e.g., Dining Services"
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
          </Form.Group>
          <Form.Group controlId="categoryLearnMore" className="mt-3">
            <Form.Label>Learn More Link</Form.Label>
            <Form.Control
              type="url"
              value={learnMore}
              onChange={(e) => setLearnMore(e.target.value)}
              disabled={submitting}
              placeholder="https://example.com"
            />
            <Form.Text className="d-block mt-2 text-muted">
              <small>
                Paste a full URL. This will be shown as a separate Learn More link on the Campus Life page.
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
