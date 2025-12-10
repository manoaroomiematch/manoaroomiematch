/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */
/**
 * Modal for admin to select suspension duration and add notes
 */
import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface SuspensionModalProps {
  show: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: (durationHours: number, notes: string) => void;
  isLoading?: boolean;
}

const presetDurations = [
  { label: '1 day', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
  { label: '30 days', hours: 720 },
];

const SuspensionModal: React.FC<SuspensionModalProps> = ({
  show,
  userName,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(24);
  const [customDuration, setCustomDuration] = useState('');
  const [customUnit, setCustomUnit] = useState<'hours' | 'days'>('days');
  const [notes, setNotes] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleReset = () => {
    setSelectedDuration(24);
    setCustomDuration('');
    setCustomUnit('days');
    setNotes('');
    setUseCustom(false);
  };

  const handleConfirm = () => {
    let durationHours: number;

    if (useCustom) {
      const customValue = parseInt(customDuration, 10);
      if (!customDuration || customValue <= 0) {
        // eslint-disable-next-line no-alert
        alert('Please enter a valid duration');
        return;
      }
      durationHours = customUnit === 'days' ? customValue * 24 : customValue;
    } else if (selectedDuration === null) {
      // eslint-disable-next-line no-alert
      alert('Please select or enter a duration');
      return;
    } else {
      durationHours = selectedDuration;
    }

    onConfirm(durationHours, notes);
    handleReset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Suspend User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">
          <strong>User:</strong>
          {' '}
          {userName}
        </p>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Select Duration</Form.Label>
          <div className="d-flex flex-column gap-2">
            {presetDurations.map((preset) => (
              <Form.Check
                key={preset.hours}
                type="radio"
                id={`duration-${preset.hours}`}
                label={preset.label}
                name="duration"
                value={preset.hours}
                checked={selectedDuration === preset.hours && !useCustom}
                onChange={() => {
                  setSelectedDuration(preset.hours);
                  setUseCustom(false);
                }}
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            id="use-custom"
            label="Custom Duration"
            checked={useCustom}
            onChange={(e) => setUseCustom(e.target.checked)}
          />
          {useCustom && (
            <Row className="mt-3">
              <Col xs={8}>
                <Form.Control
                  type="number"
                  placeholder="Enter duration"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  min="1"
                />
              </Col>
              <Col xs={4}>
                <Form.Select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as 'hours' | 'days')}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </Form.Select>
              </Col>
            </Row>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Notes (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Add notes about this suspension..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="warning"
          onClick={handleConfirm}
          disabled={isLoading || (useCustom && !customDuration)}
        >
          {isLoading ? 'Suspending...' : 'Suspend User'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuspensionModal;
