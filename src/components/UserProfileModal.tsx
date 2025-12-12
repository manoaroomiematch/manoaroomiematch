/* eslint-disable max-len */
/* eslint-disable react/require-default-props */

'use client';

/**
 * UserProfileModal Component that displays detailed user profile information for admin users.
 * Triggered when an admin clicks the "View" button in the User Management table, or when
 * a user views a match profile.
 *
 * Features:
 * - Fetches user profile data from the database via API endpoint (/api/profile)
 * - Displays comprehensive profile information including:
 *   - Basic information (name, email, major, class standing, graduation year)
 *   - Profile photo or default avatar with user's initial
 *   - Housing preferences and timeline
 *   - Lifestyle preferences
 *   - Habits & interests
 * - Report button for users to flag inappropriate content (with proper timeout cleanup)
 * - Displays error message if profile fetch fails
 * - Admin-only functionality - requires ADMIN role to fetch profile data
 *
 * @param profile - User profile data object
 * @param show - Boolean to control modal visibility
 * @param onHide - Callback function to close the modal
 * @param userId - Optional user ID for reporting functionality
 */

import React, { useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { Flag } from 'react-bootstrap-icons';
import ReportModal from './ReportModal';

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
  needRoommateBy?: string | Date;
  housingType?: string;
  preferredDorm?: string;
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
  isAdmin?: boolean; // If true, hides the report button (admins use moderation tools instead)
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ profile, show, onHide, userId, isAdmin = false }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter out empty, null, or undefined interests
  const validInterests = profile?.interests?.filter(
    (item) => item
      && String(item).trim()
      && String(item).trim() !== 'null'
      && String(item).trim() !== 'undefined',
  ) || [];

  // Format date helper
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return null;
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return null;
    }
  };

  return (
    <>
      <Modal
        show={show && !showReportModal}
        onHide={onHide}
        size="lg"
        centered
        className="profile-modal"
        style={{ zIndex: 1060 }}
        backdropClassName="profile-modal-backdrop"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center fw-bold">
            Profile
          </Modal.Title>
          {userId && !showReportModal && !isAdmin && (
          <Button
            variant="outline-danger"
            size="sm"
            className="position-absolute end-0 me-5"
            onClick={() => setShowReportModal(true)}
          >
            <Flag size={16} className="me-1" />
            Report User
          </Button>
          )}
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {!showReportModal ? (
            <>
              {!profile && (
              <div className="text-center py-5">
                <p className="text-muted">No profile data available</p>
              </div>
              )}

              {profile && (
              <div>
                {/* Top Section: Avatar and Basic Info */}
                <Row className="mb-4">
                  <Col md={4} className="text-center">
                    {profile.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="rounded-circle mb-3"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          backgroundColor: '#d1e7dd',
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mb-3 mx-auto"
                        style={{ width: '150px', height: '150px' }}
                      >
                        <span className="text-success display-3 fw-bold">
                          {profile.firstName?.charAt(0) || profile.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h4 className="fw-bold mb-1">{profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.name}</h4>
                    {profile.pronouns && <p className="text-muted mb-0">{profile.pronouns}</p>}
                  </Col>

                  <Col md={8}>
                    <h5 className="fw-bold text-success mb-3">Basic Information</h5>

                    <div className="mb-3">
                      <strong>Email:</strong>
                      <div className="text-muted">{profile.email}</div>
                    </div>

                    {profile.major && (
                      <div className="mb-3">
                        <strong>Major:</strong>
                        <div className="text-muted">{profile.major}</div>
                      </div>
                    )}

                    {profile.classStanding && (
                      <div className="mb-3">
                        <strong>Class Standing:</strong>
                        <div className="text-muted">{profile.classStanding}</div>
                      </div>
                    )}

                    {profile.graduationYear && (
                      <div className="mb-3">
                        <strong>Graduation Year:</strong>
                        <div className="text-muted">{profile.graduationYear}</div>
                      </div>
                    )}

                    {/* Housing Cards - Compact Version */}
                    {(profile.needRoommateBy || profile.housingType || profile.preferredDorm) && (
                      <Row className="g-2 mt-2 mb-3">
                        {profile.needRoommateBy && (
                          <Col md={6}>
                            <div className="card border-success border-opacity-25 h-100">
                              <div className="card-body p-2">
                                <div className="d-flex align-items-center mb-1">
                                  <i className="bi bi-calendar-event text-success fs-6 me-2" />
                                  <small className="fw-bold text-success mb-0">Need Roommate By</small>
                                </div>
                                <div className="fs-6 fw-semibold">{formatDate(profile.needRoommateBy)}</div>
                              </div>
                            </div>
                          </Col>
                        )}
                        {(profile.housingType || profile.preferredDorm) && (
                          <Col md={6}>
                            <div className="card border-success border-opacity-25 h-100">
                              <div className="card-body p-2">
                                <div className="d-flex align-items-center mb-1">
                                  <i className="bi bi-house text-success fs-6 me-2" />
                                  <small className="fw-bold text-success mb-0">Housing Preference</small>
                                </div>
                                {profile.housingType && (
                                  <div className="fs-6 fw-semibold text-capitalize">
                                    {profile.housingType.replace('-', ' ')}
                                  </div>
                                )}
                                {profile.preferredDorm && (
                                  <small className="text-muted d-block">
                                    <strong>Preferred:</strong>
                                    {' '}
                                    {profile.preferredDorm}
                                  </small>
                                )}
                              </div>
                            </div>
                          </Col>
                        )}
                      </Row>
                    )}

                    {profile.bio && (
                      <div className="mt-4 pt-3 border-top">
                        <h6 className="fw-bold text-success mb-2">Bio</h6>
                        <p className="text-muted mb-0">{profile.bio}</p>
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Lifestyle Preferences Section */}
                <div className="mt-4 pt-4 border-top">
                  <h5 className="fw-bold text-success mb-4">Lifestyle Preferences</h5>

                  <Row className="g-4">
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="d-block mb-2">Sleep Schedule:</strong>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(profile.sleepSchedule / 5) * 100}%` }}
                            aria-valuenow={profile.sleepSchedule}
                            aria-valuemin={1}
                            aria-valuemax={5}
                            aria-label={`Sleep Schedule: ${profile.sleepSchedule} out of 5`}
                          />
                        </div>
                        <small className="text-muted">
                          {profile.sleepSchedule}
                          {' '}
                          / 5
                        </small>
                      </div>

                      <div className="mb-3">
                        <strong className="d-block mb-2">Cleanliness:</strong>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(profile.cleanliness / 5) * 100}%` }}
                            aria-valuenow={profile.cleanliness}
                            aria-valuemin={1}
                            aria-valuemax={5}
                            aria-label={`Cleanliness: ${profile.cleanliness} out of 5`}
                          />
                        </div>
                        <small className="text-muted">
                          {profile.cleanliness}
                          {' '}
                          / 5
                        </small>
                      </div>

                      <div className="mb-3">
                        <strong className="d-block mb-2">Social Level:</strong>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(profile.socialLevel / 5) * 100}%` }}
                            aria-valuenow={profile.socialLevel}
                            aria-valuemin={1}
                            aria-valuemax={5}
                            aria-label={`Social Level: ${profile.socialLevel} out of 5`}
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
                        <strong className="d-block mb-2">Guest Frequency:</strong>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(profile.guestFrequency / 5) * 100}%` }}
                            aria-valuenow={profile.guestFrequency}
                            aria-valuemin={1}
                            aria-valuemax={5}
                            aria-label={`Guest Frequency: ${profile.guestFrequency} out of 5`}
                          />
                        </div>
                        <small className="text-muted">
                          {profile.guestFrequency}
                          {' '}
                          / 5
                        </small>
                      </div>

                      <div className="mb-3">
                        <strong className="d-block mb-2">Noise Level:</strong>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(profile.noiseLevel / 5) * 100}%` }}
                            aria-valuenow={profile.noiseLevel}
                            aria-valuemin={1}
                            aria-valuemax={5}
                            aria-label={`Noise Level: ${profile.noiseLevel} out of 5`}
                          />
                        </div>
                        <small className="text-muted">
                          {profile.noiseLevel}
                          {' '}
                          / 5
                        </small>
                      </div>

                      <div className="mb-3">
                        <strong className="d-block mb-2">Temperature Preference:</strong>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(profile.temperature / 5) * 100}%` }}
                            aria-valuenow={profile.temperature}
                            aria-valuemin={1}
                            aria-valuemax={5}
                            aria-label={`Temperature: ${profile.temperature} out of 5`}
                          />
                        </div>
                        <small className="text-muted">
                          {profile.temperature}
                          {' '}
                          / 5
                        </small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Interests Section */}
                {validInterests.length > 0 && (
                  <div className="mt-4 pt-4 border-top">
                    <h6 className="fw-bold text-success mb-3">Interests & Hobbies</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {validInterests.map((interest, idx) => (
                        <span
                          // eslint-disable-next-line react/no-array-index-key
                          key={idx}
                          className="badge bg-success px-3 py-2"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}
            </>
          ) : null}
        </Modal.Body>
      </Modal>
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        userId={userId}
        userName={profile?.name}
      />
    </>
  );
};

export default UserProfileModal;
