'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PersonCircle, StarFill, Star, ArrowRight, Lightning } from 'react-bootstrap-icons';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';

type APIMatch = {
  id: string;
  overallScore: number;
  user1Id: string;
  user2Id: string;
  user1: {
    id: string;
    name: string | null;
    major: string | null;
    photoUrl: string | null;
    interests: string[] | null;
    pronouns?: string | null;
    bio?: string | null;
    classStanding?: string | null;
    graduationYear?: number | null;
    housingPreferences?: string[] | null;
  };
  user2: {
    id: string;
    name: string | null;
    major: string | null;
    photoUrl: string | null;
    interests: string[] | null;
    pronouns?: string | null;
    bio?: string | null;
    classStanding?: string | null;
    graduationYear?: number | null;
    housingPreferences?: string[] | null;
  };
};

const MatchesCardOverview: React.FC = () => {
  const [topMatches, setTopMatches] = useState<APIMatch[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.matches && data.currentProfileId) {
          setCurrentProfileId(String(data.currentProfileId));
          const sorted = [...data.matches].sort((a: APIMatch, b: APIMatch) => b.overallScore - a.overallScore);
          setTopMatches(sorted.slice(0, 3));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
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

      {loading && (
        <p className="text-muted">Loading top matches...</p>
      )}
      {!loading && topMatches.length === 0 && (
        <p className="text-muted">No matches yet. Complete your lifestyle survey to get matches.</p>
      )}
      {!loading && topMatches.length > 0 && (
        <Row className="g-4">
          {topMatches.map((m) => {
            const other = currentProfileId === m.user1Id ? m.user2 : m.user1;
            const name = other.name || 'Profile';
            const major = other.major || null;
            const traits = Array.isArray(other.interests) ? other.interests : [];
            const { photoUrl } = other;
            const isHighMatch = m.overallScore >= 80;
            const pronouns = other.pronouns ?? null;
            const classStanding = other.classStanding ?? null;
            const graduationYear = other.graduationYear ?? null;
            const housingPrefs = Array.isArray(other.housingPreferences) ? other.housingPreferences : [];
            const bio = other.bio ?? null;

            return (
              <Col key={m.id} xs={12} sm={6} lg={4}>
                <Card className="match-card match-card-grid shadow-sm h-100">
                  {/* NEW BADGE */}
                  <div
                    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
                  >
                    <Badge bg="success" className="px-3 py-2">
                      <Lightning className="me-1" size={14} />
                      TOP
                    </Badge>
                  </div>

                  {/* PHOTO SECTION */}
                  <div className="match-photo-container">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={`${name} photo`}
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
                    <Card.Title className="match-name">{name}</Card.Title>
                    {major && (
                      <Card.Subtitle className="mb-2 text-muted match-major">{major}</Card.Subtitle>
                    )}
                    {/* Optional quick details: render only if present */}
                    {(pronouns || classStanding || graduationYear) && (
                      <div className="small text-muted mb-2">
                        {pronouns && <span>{pronouns}</span>}
                        {pronouns && (classStanding || graduationYear) && <span className="mx-1">·</span>}
                        {classStanding && <span>{classStanding}</span>}
                        {classStanding && graduationYear && <span className="mx-1">·</span>}
                        {graduationYear && <span>{graduationYear}</span>}
                      </div>
                    )}
                    {housingPrefs.length > 0 && (
                      <Card.Text className="small mb-2">
                        <strong>Housing:</strong>
                        {housingPrefs.slice(0, 3).join(', ')}
                      </Card.Text>
                    )}
                    {traits.length > 0 && (
                      <Card.Text className="match-traits">
                        <strong>Interests:</strong>
                        {traits.slice(0, 3).join(' · ')}
                      </Card.Text>
                    )}
                    {bio && (
                      <Card.Text
                        className="small text-muted"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {bio}
                      </Card.Text>
                    )}
                    <div className="match-percentage">
                      {isHighMatch ? (
                        <StarFill className="text-warning me-1" size={20} />
                      ) : (
                        <Star className="text-warning me-1" size={20} />
                      )}
                      <strong>
                        {Math.round(m.overallScore)}
                        % Match
                      </strong>
                    </div>
                    <Link href={`/comparison/${m.id}`} passHref legacyBehavior>
                      <Button variant="success" className="mt-3 w-100">View Details</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default MatchesCardOverview;
