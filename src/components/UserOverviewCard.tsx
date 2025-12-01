'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, Button } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';

interface UserOverviewCardProps {
  name: string;
  year?: string;
  major?: string;
  graduationYear?: number;
  email: string;
  photoUrl?: string;
}

const UserOverviewCard: React.FC<UserOverviewCardProps> = ({
  name,
  year,
  major,
  graduationYear,
  email,
  photoUrl,
}) => (
  <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: '12px' }}>
    <Card.Body className="p-4">
      {/* Profile Image - Centered at Top */}
      <div className="text-center mb-4">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${name}'s profile picture`}
            width={150}
            height={150}
            className="rounded-circle"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <PersonCircle size={150} className="text-secondary" />
        )}
      </div>

      {/* Content - Below Image */}
      <div className="text-center">
        {/* Name + major */}
        <h2 className="fw-bold mb-1">{name}</h2>
        <p className="text-muted mb-3">{major || 'Major not set'}</p>
      </div>

      {/* Details */}
      <div className="mt-4">
        {year && (
          <p className="mb-2">
            <strong>Year:</strong>
            {' '}
            {year}
          </p>
        )}
        {graduationYear && (
          <p className="mb-2">
            <strong>Graduation:</strong>
            {' '}
            {graduationYear}
          </p>
        )}
        <p className="mb-2">
          <strong>Email:</strong>
          {' '}
          {email}
        </p>
      </div>

      <div className="mt-4 d-grid">
        <Link href="/edit-profile" passHref legacyBehavior>
          <Button variant="success" size="lg">
            Edit Profile
          </Button>
        </Link>
      </div>
    </Card.Body>
  </Card>
);

export default UserOverviewCard;
