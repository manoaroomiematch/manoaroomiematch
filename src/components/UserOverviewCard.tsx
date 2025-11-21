'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, Button } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';

interface UserOverviewCardProps {
  name: string;
  year: string;
  age: number;
  major: string;
  bio: string;
  photoUrl: string;
}

const UserOverviewCard: React.FC<UserOverviewCardProps> = ({
  name,
  year,
  age,
  major,
  bio,
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
        <p className="text-muted mb-3">{major}</p>
      </div>

      {/* Details */}
      <div className="mt-3">
        <p className="mb-2">
          <strong>Year:</strong>
          {' '}
          {year}
        </p>
        <p className="mb-2">
          <strong>Age:</strong>
          {' '}
          {age}
        </p>
        <p className="mb-2">
          <strong>Bio:</strong>
          {' '}
          {bio}
        </p>
      </div>

      {/* Edit Profile Button */}
      <div className="mt-4">
        <Link href="/lifestyle-survey" passHref legacyBehavior>
          <Button variant="success" className="w-100">
            Edit Profile
          </Button>
        </Link>
      </div>
    </Card.Body>
  </Card>
);

export default UserOverviewCard;
