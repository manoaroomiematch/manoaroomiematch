'use client';

/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface ReportModalProps {
  show: boolean;
  onHide: () => void;
  userId?: number;
  userName?: string;
}

const REPORT_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'harassment_bullying', label: 'Harassment/bullying' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'spam_scam', label: 'Spam/scam' },
  { value: 'other', label: 'Other' },
];

const ReportModal: React.FC<ReportModalProps> = ({
  show,
  onHide,
  userId,
  userName = 'this user',
}) => {
  const [step, setStep] = useState<'reason' | 'description' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [hasPendingReport, setHasPendingReport] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [pendingReportTime, setPendingReportTime] = useState<string | null>(null);

  const formatReportDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check report status from API when modal opens
  useEffect(() => {
    if (!show || !userId) {
      return undefined;
    }

    const checkReportStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const response = await fetch('/api/reports/status');
        if (response.ok) {
          const data = await response.json();
          const reports = data.reports || [];

          // Find the latest report for this user
          const userReport = reports.find(
            (r: any) => r.reportedUserId === userId,
          );

          if (userReport) {
            // If the report is still pending, user cannot submit another
            if (userReport.status === 'pending') {
              setHasPendingReport(true);
              setPendingReportTime(userReport.createdAt);
            } else {
              // Report has been resolved, user can submit again
              setHasPendingReport(false);
              setPendingReportTime(null);
            }
          } else {
            // No previous report found
            setHasPendingReport(false);
            setPendingReportTime(null);
          }
        }
      } catch (error) {
        console.error('Error checking report status:', error);
        // On error, allow user to proceed
        setHasPendingReport(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkReportStatus();
    return undefined;
  }, [show, userId]);

  const handleNext = () => {
    if (step === 'reason') {
      if (!selectedReason.trim()) {
        setReportError('Please select a reason');
        return;
      }
      setReportError(null);
      setStep('description');
    } else if (step === 'description') {
      if (!description.trim() && selectedReason !== 'other') {
        setReportError('Please provide a description');
        return;
      }
      setReportError(null);
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'description') {
      setStep('reason');
    } else if (step === 'confirm') {
      setStep('description');
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      setReportError('Unable to submit report');
      return;
    }

    setReportLoading(true);
    setReportError(null);

    try {
      const reasonLabel = REPORT_REASONS.find((r) => r.value === selectedReason)?.label || selectedReason;
      const fullReason = description ? `[${reasonLabel}] ${description}` : reasonLabel;

      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: userId,
          reason: fullReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReportError(data.error || 'Failed to submit report');
        return;
      }

      setReportSuccess(true);

      // Reset after 5 seconds
      setTimeout(() => {
        onHide();
        setStep('reason');
        setSelectedReason('');
        setDescription('');
        setReportSuccess(false);
      }, 5000);
    } catch (err) {
      setReportError('An error occurred while submitting your report');
      console.error('Report error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleClose = () => {
    setStep('reason');
    setSelectedReason('');
    setDescription('');
    setReportError(null);
    setReportSuccess(false);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      style={{ zIndex: 2000 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Report
          {' '}
          {userName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isCheckingStatus && (
          <Alert variant="info">Checking report status...</Alert>
        )}
        {hasPendingReport && !isCheckingStatus && (
          <Alert variant="warning">
            <strong>Report Under Review</strong>
            <p className="mb-2">
              You already have a pending report for this user submitted on
              {' '}
              <strong>{pendingReportTime ? formatReportDate(pendingReportTime) : 'a previous date'}</strong>
              .
            </p>
            <p className="mb-0 text-muted">
              Please wait for the moderation team to review and take action on your pending report
              before submitting a new one. If the user continues the behavior after the report is
              resolved, you&apos;ll be able to submit another report immediately.
            </p>
          </Alert>
        )}
        {reportSuccess && (
          <Alert variant="success">
            <strong>Thank you!</strong>
            {' '}
            Your report has been submitted successfully. The moderation team will
            review it shortly.
          </Alert>
        )}
        {!reportSuccess && !hasPendingReport && !isCheckingStatus ? (
          <>
            {reportError && <Alert variant="danger">{reportError}</Alert>}

            {step === 'reason' && (
              <div>
                <p className="mb-3 text-muted">
                  Please select the reason for reporting:
                </p>
                <Form.Group>
                  {REPORT_REASONS.map((reason) => (
                    <Form.Check
                      key={reason.value}
                      type="radio"
                      id={`reason-${reason.value}`}
                      label={reason.label}
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mb-2"
                    />
                  ))}
                </Form.Group>
              </div>
            )}

            {step === 'description' && (
              <div>
                <p className="mb-3 text-muted">
                  Please provide details about your report:
                </p>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe what happened, be specific and factual..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={reportLoading}
                  />
                  <Form.Text className="text-muted d-block mt-2">
                    Reason:
                    {' '}
                    <strong>
                      {REPORT_REASONS.find((r) => r.value === selectedReason)?.label}
                    </strong>
                  </Form.Text>
                </Form.Group>
              </div>
            )}

            {step === 'confirm' && (
              <div>
                <Alert variant="info">
                  <strong>Review your report:</strong>
                  <p className="mb-2 mt-2">
                    <strong>Reason:</strong>
                    {' '}
                    {REPORT_REASONS.find((r) => r.value === selectedReason)?.label}
                  </p>
                  {description && (
                    <p className="mb-0">
                      <strong>Details:</strong>
                      <br />
                      {description}
                    </p>
                  )}
                </Alert>
                <p className="text-muted small">
                  Once submitted, the moderation team will review this report. If the
                  user continues the behavior after the report is resolved, you can
                  submit another report.
                </p>
              </div>
            )}
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        {!reportSuccess && !hasPendingReport && !isCheckingStatus && (
          <>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={reportLoading}
            >
              Cancel
            </Button>
            {step !== 'reason' && (
              <Button
                variant="outline-secondary"
                onClick={handleBack}
                disabled={reportLoading}
              >
                Back
              </Button>
            )}
            {step === 'confirm' ? (
              <Button
                variant="danger"
                onClick={handleSubmit}
                disabled={reportLoading || !selectedReason}
              >
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={reportLoading || !selectedReason}
              >
                Next
              </Button>
            )}
          </>
        )}
        {(hasPendingReport || isCheckingStatus) && (
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
