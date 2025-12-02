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

import React, { useEffect, useState } from 'react';
import { Modal, Card, Row, Col, Spinner } from 'react-bootstrap';

interface UserProfileModalProps {
  email: string | null;
  show: boolean;
  onHide: () => void;
}

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

const UserProfileModal: React.FC<UserProfileModalProps> = ({ email, show, onHide }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show || !email) {
      setProfile(null);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email, show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>User Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {profile && !loading && (
          <div>
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center">
                    {profile.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="rounded-circle mb-2"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center
                         justify-content-center mb-2 mx-auto"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <span className="text-white fs-1">{profile.name.charAt(0)}</span>
                      </div>
                    )}
                    <h5>{profile.name}</h5>
                    {profile.pronouns && <p className="text-muted">{profile.pronouns}</p>}
                  </Col>
                  <Col md={8}>
                    <h6>Basic Information</h6>
                    <p>
                      <strong>Email:</strong>
                      {' '}
                      {profile.email}
                    </p>
                    {profile.major && (
                      <p>
                        <strong>Major:</strong>
                        {' '}
                        {profile.major}
                      </p>
                    )}
                    {profile.classStanding && (
                      <p>
                        <strong>Class Standing:</strong>
                        {' '}
                        {profile.classStanding}
                      </p>
                    )}
                    {profile.graduationYear && (
                      <p>
                        <strong>Graduation Year:</strong>
                        {' '}
                        {profile.graduationYear}
                      </p>
                    )}
                    {profile.bio && (
                      <>
                        <h6 className="mt-3">Bio</h6>
                        <p>{profile.bio}</p>
                      </>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <h6>Lifestyle Preferences</h6>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Sleep Schedule:</strong>
                      {' '}
                      {profile.sleepSchedule}
                      /5
                    </p>
                    <p>
                      <strong>Cleanliness:</strong>
                      {' '}
                      {profile.cleanliness}
                      /5
                    </p>
                    <p>
                      <strong>Noise Level:</strong>
                      {' '}
                      {profile.noiseLevel}
                      /5
                    </p>
                    <p>
                      <strong>Social Level:</strong>
                      {' '}
                      {profile.socialLevel}
                      /5
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Guest Frequency:</strong>
                      {' '}
                      {profile.guestFrequency}
                      /5
                    </p>
                    <p>
                      <strong>Temperature:</strong>
                      {' '}
                      {profile.temperature}
                      /5
                    </p>
                    <p>
                      <strong>Work Schedule:</strong>
                      {' '}
                      {profile.workSchedule}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <h6>Habits & Interests</h6>
                <p>
                  <strong>Smoking:</strong>
                  {' '}
                  {profile.smoking ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Drinking:</strong>
                  {' '}
                  {profile.drinking}
                </p>
                <p>
                  <strong>Pets:</strong>
                  {' '}
                  {profile.pets ? `Yes (${profile.petTypes.join(', ')})` : 'No'}
                </p>
                {profile.dietary.length > 0 && (
                  <p>
                    <strong>Dietary:</strong>
                    {' '}
                    {profile.dietary.join(', ')}
                  </p>
                )}
                {profile.interests.length > 0 && (
                  <p>
                    <strong>Interests:</strong>
                    {' '}
                    {profile.interests.join(', ')}
                  </p>
                )}
              </Card.Body>
            </Card>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UserProfileModal;
