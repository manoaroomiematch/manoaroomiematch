/* eslint-disable max-len */
/* eslint-disable react/require-default-props */

'use client';

/**
 * UserProfileModal Component that displays detailed user profile information for admin users.
 * Triggered when an admin clicks the "View" button in the User Management table.
 *
 * Features:
 * - Fetches user profile data from the database via API endpoint (/api/profile)
 * - Displays comprehensive profile information including:
 *   - Basic information (name, email, major, class standing, graduation year)
 *   - Profile photo or default avatar with user's initial
 *   - Lifestyle preferences
 *   - Habits & interests
 * - Displays error message if profile fetch fails
 * - Admin-only functionality - requires ADMIN role to fetch profile data
 *
 * @param email - The email address of the user whose profile should be displayed
 * @param show - Boolean to control modal visibility
 * @param onHide - Callback function to close the modal
 */

import React from 'react';
import { Modal, Card, Row, Col } from 'react-bootstrap';

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
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ profile, show, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered className="profile-modal" style={{ paddingTop: '80px' }}>
    <Modal.Header closeButton className="border-bottom border-success border-opacity-25 bg-light rounded-top" style={{ borderRadius: '12px 12px 0 0' }}>
      <Modal.Title className="fw-bold text-success">
        {profile?.firstName ? `${profile.firstName}'s Profile` : 'User Profile'}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light" style={{ borderRadius: '0 0 12px 12px' }}>
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
    </Modal.Body>
  </Modal>
);

export default UserProfileModal;
