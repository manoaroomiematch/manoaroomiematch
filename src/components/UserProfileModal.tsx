/* eslint-disable max-len */
/* eslint-disable react/require-default-props */

'use client';

/**
 * UserProfileModal Component that displays detailed user profile information.
 * Can be triggered by:
 * - Admin clicking "View" in User Management table
 * - User viewing a match profile in match details
 *
 * Features:
 * - Displays comprehensive profile information including:
 *   - Basic information (name, email, major, class standing, graduation year)
 *   - Profile photo or default avatar with user's initial
 *   - Lifestyle preferences
 *   - Habits & interests
 * - Report button for users to flag inappropriate content
 * - Displays error message if profile fetch fails
 *
 * @param profile - User profile data object
 * @param show - Boolean to control modal visibility
 * @param onHide - Callback function to close the modal
 * @param userId - Optional user ID for reporting functionality
 */

import React, { useState } from 'react';
import { Modal, Card, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { Flag } from 'react-bootstrap-icons';

interface ProfileData {
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  pronouns?: string;
  bio?: string;
  photoUrl?: string;
  major?: string;
  classStanding?: string;
  graduationYear?: number;
  sleepSchedule: number;
  cleanliness: number;
  noiseLevel: number;
  socialLevel: number;
  guestFrequency: number;
  temperature: number;
  smoking: boolean;
  drinking: string;
  pets: boolean;
  petTypes: string[];
  dietary: string[];
  interests: string[];
  workSchedule: string;
}

interface UserProfileModalProps {
  profile: ProfileData | null;
  show: boolean;
  onHide: () => void;
  userId?: number; // Optional user ID for reporting functionality
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ profile, show, onHide, userId }) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      setReportError('Please provide a reason for the report');
      return;
    }

    if (!userId) {
      setReportError('Unable to report this user');
      return;
    }

    setReportLoading(true);
    setReportError(null);

    try {
      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: userId,
          reason: reportReason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReportError(data.error || 'Failed to submit report');
        return;
      }

      setReportSuccess(true);
      setReportReason('');
      setTimeout(() => {
        setShowReportForm(false);
        setReportSuccess(false);
      }, 2000);
    } catch (err) {
      setReportError('An error occurred while submitting your report');
      console.error('Report error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleCloseReport = () => {
    setShowReportForm(false);
    setReportReason('');
    setReportError(null);
    setReportSuccess(false);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="profile-modal" style={{ paddingTop: '80px' }}>
      <Modal.Header closeButton className="border-bottom border-success border-opacity-25 bg-light rounded-top" style={{ borderRadius: '12px 12px 0 0' }}>
        <Modal.Title className="fw-bold text-success">
          {profile?.firstName ? `${profile.firstName}'s Profile` : 'User Profile'}
        </Modal.Title>
        {userId && !showReportForm && (
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-auto"
            onClick={() => setShowReportForm(true)}
          >
            <Flag size={16} className="me-1" />
            Report User
          </Button>
        )}
      </Modal.Header>
      <Modal.Body className="bg-light" style={{ borderRadius: '0 0 12px 12px' }}>
        {showReportForm ? (
          <div className="mb-4">
            <h6 className="fw-bold text-danger mb-3">Report User</h6>
            {reportSuccess ? (
              <Alert variant="success">
                Thank you! Your report has been submitted successfully. The moderation team will review it shortly.
              </Alert>
            ) : (
              <>
                {reportError && <Alert variant="danger">{reportError}</Alert>}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Report Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Please describe why you're reporting this user..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    disabled={reportLoading}
                  />
                  <Form.Text className="text-muted d-block mt-1">
                    Please be specific and factual in your report.
                  </Form.Text>
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button
                    variant="danger"
                    onClick={handleReport}
                    disabled={reportLoading || !reportReason.trim()}
                  >
                    {reportLoading ? 'Submitting...' : 'Submit Report'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCloseReport}
                    disabled={reportLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {!profile && (
              <div className="text-center py-5">
                <p className="text-muted">No profile data available</p>
              </div>
            )}

            {profile && (
              <div>
                {/* Basic Information Card */}
                <Card className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <Row>
                      <Col md={4} className="text-center">
                        {profile.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.photoUrl}
                            alt={profile.name}
                            className="rounded-circle mb-3 border border-3 border-success"
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mb-3 mx-auto"
                            style={{ width: '120px', height: '120px' }}
                          >
                            <span className="text-success fs-1 fw-bold">{profile.name.charAt(0)}</span>
                          </div>
                        )}
                        <h5 className="fw-bold">{profile.name}</h5>
                        {profile.pronouns && <p className="text-muted small">{profile.pronouns}</p>}
                      </Col>
                      <Col md={8}>
                        <h6 className="fw-bold text-success mb-3">Basic Information</h6>
                        <div className="mb-2">
                          <p className="mb-1">
                            <strong>Email:</strong>
                          </p>
                          <p className="text-muted">{profile.email}</p>
                        </div>
                        {profile.major && (
                          <div className="mb-2">
                            <p className="mb-1">
                              <strong>Major:</strong>
                            </p>
                            <p className="text-muted">{profile.major}</p>
                          </div>
                        )}
                        {profile.classStanding && (
                        <div className="mb-2">
                          <p className="mb-1">
                            <strong>Class Standing:</strong>
                          </p>
                          <p className="text-muted">{profile.classStanding}</p>
                        </div>
                        )}
                        {profile.graduationYear && (
                        <div className="mb-2">
                          <p className="mb-1">
                            <strong>Graduation Year:</strong>
                          </p>
                          <p className="text-muted">{profile.graduationYear}</p>
                        </div>
                        )}
                        {profile.bio && (
                        <div className="mt-3 pt-2 border-top border-success border-opacity-25">
                          <h6 className="fw-bold text-success mb-2">Bio</h6>
                          <p className="text-muted">{profile.bio}</p>
                        </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Lifestyle Preferences Card */}
                <Card className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="fw-bold text-success mb-3">Lifestyle Preferences</h6>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Sleep Schedule:</strong>
                          </p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${(profile.sleepSchedule / 5) * 100}%` }}
                            />
                          </div>
                          <small className="text-muted">
                            {profile.sleepSchedule}
                            {' '}
                            / 5
                          </small>
                        </div>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Cleanliness:</strong>
                          </p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${(profile.cleanliness / 5) * 100}%` }}
                            />
                          </div>
                          <small className="text-muted">
                            {profile.cleanliness}
                            {' '}
                            / 5
                          </small>
                        </div>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Noise Level:</strong>
                          </p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${(profile.noiseLevel / 5) * 100}%` }}
                            />
                          </div>
                          <small className="text-muted">
                            {profile.noiseLevel}
                            {' '}
                            / 5
                          </small>
                        </div>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Social Level:</strong>
                          </p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${(profile.socialLevel / 5) * 100}%` }}
                            />
                          </div>
                          <small className="text-muted">
                            {profile.socialLevel}
                            {' '}
                            / 5
                          </small>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Guest Frequency:</strong>
                          </p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${(profile.guestFrequency / 5) * 100}%` }}
                            />
                          </div>
                          <small className="text-muted">
                            {profile.guestFrequency}
                            {' '}
                            / 5
                          </small>
                        </div>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Temperature:</strong>
                          </p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${(profile.temperature / 5) * 100}%` }}
                            />
                          </div>
                          <small className="text-muted">
                            {profile.temperature}
                            {' '}
                            / 5
                          </small>
                        </div>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Work Schedule:</strong>
                          </p>
                          <p className="text-muted">{profile.workSchedule}</p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Habits & Interests Card */}
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="fw-bold text-success mb-3">Habits & Interests</h6>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Smoking:</strong>
                          </p>
                          <p className="text-muted">{profile.smoking ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Drinking:</strong>
                          </p>
                          <p className="text-muted">{profile.drinking}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <p className="mb-1">
                            <strong>Pets:</strong>
                          </p>
                          <p className="text-muted">
                            {profile.pets ? `Yes (${profile.petTypes.join(', ')})` : 'No'}
                          </p>
                        </div>
                      </Col>
                    </Row>
                    {profile.dietary.length > 0 && (
                    <div className="mb-3 pt-2 border-top border-success border-opacity-25">
                      <p className="mb-1">
                        <strong>Dietary Preferences:</strong>
                      </p>
                      <p className="text-muted">{profile.dietary.join(', ')}</p>
                    </div>
                    )}
                    {profile.interests.length > 0 && (
                    <div className="pt-2 border-top border-success border-opacity-25">
                      <p className="mb-2">
                        <strong>Interests:</strong>
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {profile.interests.map((interest, idx) => (
                          <span
                        // eslint-disable-next-line react/no-array-index-key
                            key={idx}
                            className="badge bg-success bg-opacity-20 text-success fw-normal"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UserProfileModal;
