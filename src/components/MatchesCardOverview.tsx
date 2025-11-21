'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PersonCircle, StarFill, Star } from 'react-bootstrap-icons';
import { Card, Row, Col, Button } from 'react-bootstrap';

interface Match {
  id: number;
  name: string;
  major: string;
  traits: string[];
  matchPercentage: number;
  photoUrl: string | null;
}

const matches: Match[] = [
  {
    id: 1,
    name: 'Kai Nakamura',
    major: 'Computer Science',
    traits: ['Night Owl', 'Tidy', 'Introvert'],
    matchPercentage: 92,
    photoUrl: null,
  },
  {
    id: 2,
    name: 'Leilani Santos',
    major: 'Biology',
    traits: ['Early Bird', 'Clean', 'Friendly'],
    matchPercentage: 88,
    photoUrl: null,
  },
  {
    id: 3,
    name: 'Noa Tanaka',
    major: 'Business',
    traits: ['Organized', 'Social', 'Gym Enthusiast'],
    matchPercentage: 85,
    photoUrl: null,
  },
];

const MatchesCardOverview: React.FC = () => (
  <div className="my-4">
    <h2 className="fw-bold mb-4">Your Matches</h2>

    <Row className="g-4">
      {matches.map((match) => {
        const isHighMatch = match.matchPercentage >= 80;

        return (
          <Col key={match.id} xs={12} sm={6} lg={4}>
            <Card className="match-card match-card-grid shadow-sm h-100">
              {/* PHOTO SECTION */}
              <div className="match-photo-container">
                {match.photoUrl ? (
                  <Image
                    src={match.photoUrl}
                    alt={`${match.name} photo`}
                    fill
                    className="match-photo"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="match-photo-placeholder">
                    <PersonCircle size={120} className="text-secondary" />
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <Card.Body>
                <Card.Title className="match-name">{match.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted match-major">
                  {match.major}
                </Card.Subtitle>

                <Card.Text className="match-traits">
                  {match.traits.join(' · ')}
                </Card.Text>

                <div className="match-percentage">
                  {isHighMatch ? (
                    <StarFill className="text-warning me-1" size={20} />
                  ) : (
                    <Star className="text-warning me-1" size={20} />
                  )}
                  <strong>
                    {match.matchPercentage}
                    % Match
                  </strong>
                </div>

                <Link href={`/comparison/${match.id}?userId=user-123`} passHref legacyBehavior>
                  <Button variant="success" className="mt-3 w-100">
                    View Details
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  </div>
);

export default MatchesCardOverview;
