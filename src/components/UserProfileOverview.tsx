/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { Card, Button } from 'react-bootstrap';
import { PersonCircle, CheckCircleFill, PeopleFill } from 'react-bootstrap-icons';
import Image from 'next/image';

/**
 * UserProfileOverview Component
 *
 * Displays the logged-in user's profile overview including:
 * - Profile photo
 * - Name and program/year
 * - Quick stats (survey completion, matches found)
 * - Edit Profile button
 *
 * TODO: Connect to actual user data from session/database
 * TODO: Make stats dynamic based on user's actual data
 */

interface UserProfileOverviewProps {
  name: string;
  school: string;
  program: string;
  year?: string;
  photoUrl?: string;
  surveyCompletion: number; // Percentage 0-100
  matchesFound: number;
  onEditProfile?: () => void;
}

const UserProfileOverview: React.FC<UserProfileOverviewProps> = ({
  name,
  school,
  program,
  year,
  photoUrl,
  surveyCompletion,
  matchesFound,
  onEditProfile,
}) => (
  <Card className="user-profile-overview shadow-sm">
    <Card.Body className="p-4">
      {/* Profile Header */}
      <div className="d-flex align-items-center mb-4">
        {/* Profile Photo */}
        <div className="profile-photo-container me-3">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${name} profile photo`}
              width={80}
              height={80}
              className="rounded-circle"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <PersonCircle size={80} className="text-secondary" />
          )}
        </div>

        {/* Name and Program Info */}
        <div className="flex-grow-1">
          <h3 className="mb-1 fw-bold">{name}</h3>
          <p className="text-muted mb-0">
            {school}
          </p>
          <p className="text-muted mb-0">
            {program}
            {year && ` • ${year}`}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats d-flex gap-4 mb-3">
        <div className="stat-item d-flex align-items-center">
          <CheckCircleFill className="text-success me-2" size={20} />
          <div>
            <div className="stat-value fw-bold">
              {surveyCompletion}
              %
            </div>
            <div className="stat-label text-muted small">Survey Complete</div>
          </div>
        </div>

        <div className="stat-item d-flex align-items-center">
          <PeopleFill className="text-success me-2" size={20} />
          <div>
            <div className="stat-value fw-bold">{matchesFound}</div>
            <div className="stat-label text-muted small">Matches Found</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <Button
        variant="success"
        onClick={onEditProfile}
        className="w-100"
      >
        Edit Profile
      </Button>
    </Card.Body>
  </Card>
);

export default UserProfileOverview;
