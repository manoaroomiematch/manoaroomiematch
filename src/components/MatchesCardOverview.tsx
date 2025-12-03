'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PersonCircle, StarFill, Star, ArrowRight, Lightning } from 'react-bootstrap-icons';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';

interface Match {
  id: number;
  name: string;
  major: string;
  traits: string[];
  matchPercentage: number;
  photoUrl: string | null;
  isNew?: boolean;
}

const matches: Match[] = [
  {
    id: 1,
    name: 'Kai Nakamura',
    major: 'Computer Science',
    traits: ['Night Owl', 'Tidy', 'Introvert'],
    matchPercentage: 92,
    photoUrl: null,
    isNew: true,
  },
  {
    id: 2,
    name: 'Leilani Santos',
    major: 'Biology',
    traits: ['Early Bird', 'Clean', 'Friendly'],
    matchPercentage: 88,
    photoUrl: null,
    isNew: true,
  },
  {
    id: 3,
    name: 'Noa Tanaka',
    major: 'Business',
    traits: ['Organized', 'Social', 'Gym Enthusiast'],
    matchPercentage: 85,
    photoUrl: null,
    isNew: false,
  },
];

const MatchesCardOverview: React.FC = () => (
  <div className="my-4">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold mb-0">Your Matches</h2>
      <Link href="/matches" passHref legacyBehavior>
        <Button variant="success" size="lg">
          Browse All Matches
          <ArrowRight className="ms-2" size={20} />
        </Button>
      </Link>
    </div>

    <Row className="g-4">
      {matches.map((match) => {
        const isHighMatch = match.matchPercentage >= 80;

        return (
          <Col key={match.id} xs={12} sm={6} lg={4}>
            <Card
              className="match-card match-card-grid shadow-sm h-100"
              style={{
                border: match.isNew ? '2px solid #198754' : undefined,
                boxShadow: match.isNew ? '0 0 15px rgba(25, 135, 84, 0.3)' : undefined,
              }}
            >
              {/* NEW BADGE */}
              {match.isNew && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                  }}
                >
                  <Badge bg="success" className="px-3 py-2">
                    <Lightning className="me-1" size={14} />
                    NEW
                  </Badge>
                </div>
              )}

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

                <Link href={`/comparison/${match.id}`} passHref legacyBehavior>
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
