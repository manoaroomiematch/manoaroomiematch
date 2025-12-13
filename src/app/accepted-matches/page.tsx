'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Card,
} from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, PersonCircle, Star, StarFill } from 'react-bootstrap-icons';
import { getAcceptedMatches, getPassedMatches } from '@/lib/matchActions';

// MatchData type and buildMatchCard copied from saved-matches page
// ...existing code...

type MatchData = {
  id: string;
  name: string;
  major: string;
  traits: string[];
  matchPercentage: number;
  photoUrl?: string;
};

type MatchWithProfiles = {
  id: string;
  overallScore: number;
  user1Id: string;
  user2Id: string;
  user1: any;
  user2: any;
};

const sleepLabels = ['Early Bird', 'Morning Person', 'Flexible', 'Evening Person', 'Night Owl'];
const cleanlinessLabels = ['Relaxed', 'Casual', 'Moderate', 'Tidy', 'Very Clean'];
const socialLabels = ['Homebody', 'Occasional', 'Balanced', 'Social', 'Very Social'];

const getLabel = (labels: string[], value?: number | null) => {
  if (!value) return null;
  return labels[value - 1] || null;
};

const buildTraits = (profile: any) => {
  const traits = [
    getLabel(sleepLabels, profile.sleepSchedule),
    getLabel(cleanlinessLabels, profile.cleanliness),
    getLabel(socialLabels, profile.socialLevel),
  ].filter(Boolean) as string[];
  const interests = profile.interests?.slice(0, 2) || [];
  return traits.concat(interests).slice(0, 5);
};

const buildMatchCard = (
  match: MatchWithProfiles,
  currentProfileId: string | null,
): MatchData | null => {
  let otherUser = match.user1;
  if (currentProfileId) {
    otherUser = match.user1Id === currentProfileId ? match.user2 : match.user1;
  }
  if (!otherUser) return null;
  const traits = buildTraits(otherUser);
  return {
    id: match.id,
    name: otherUser.name || 'Profile',
    major: otherUser.major || 'Major not specified',
    traits: traits.length > 0 ? traits : ['No traits available'],
    matchPercentage: Math.round(match.overallScore),
    photoUrl: otherUser.photoUrl || undefined,
  };
};

const AcceptedMatchCard: React.FC<{
  match: MatchData;
}> = ({ match }) => {
  const isHighMatch = match.matchPercentage >= 80;
  return (
    <Card className="match-card match-card-grid shadow-sm h-100 position-relative">
      {/* Photo Section */}
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
      {/* Content */}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="match-name">{match.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted match-major">{match.major}</Card.Subtitle>
        <Card.Text className="match-traits small">
          {match.traits.join(' · ')}
        </Card.Text>
        <div className="match-percentage mb-3">
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
        <div className="mt-auto d-flex gap-2 flex-column">
          <Link href={`/comparison/${match.id}`} passHref legacyBehavior>
            <Button variant="outline-primary" size="sm" className="w-100">
              View Details
            </Button>
          </Link>
          <Link href={`/messages?matchId=${match.id}`} passHref legacyBehavior>
            <Button variant="success" size="sm" className="w-100">
              Message
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default function AcceptedMatchesPage() {
  const { status } = useSession();
  const [acceptedMatches, setAcceptedMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchAcceptedMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/matches');
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load matches');
        }
        const { matches: apiMatches, currentProfileId: profileId } = payload as {
          matches: MatchWithProfiles[];
          currentProfileId: string | null;
        };
        const acceptedMatchIds = getAcceptedMatches();
        const passedMatchIds = getPassedMatches();
        const filtered = apiMatches
          .filter((match) => acceptedMatchIds.includes(match.id) && !passedMatchIds.includes(match.id))
          .map((match) => buildMatchCard(match, profileId))
          .filter((match): match is MatchData => match !== null);
        setAcceptedMatches(filtered);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load accepted matches';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchAcceptedMatches();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <main className="bg-light min-vh-100">
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your accepted matches...</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-light min-vh-100">
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <Link href="/matches" passHref legacyBehavior>
              <Button variant="outline-secondary" className="mb-3">
                <ArrowLeft className="me-2" size={18} />
                Back to Browse
              </Button>
            </Link>
            <h1 className="fw-bold">Accepted Matches</h1>
            <p className="text-muted">People you&apos;ve accepted as potential roommates</p>
          </Col>
        </Row>
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger">
                <Alert.Heading>Error Loading Matches</Alert.Heading>
                <p>{error}</p>
              </Alert>
            </Col>
          </Row>
        )}
        {!error && acceptedMatches.length === 0 && (
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center shadow-sm">
                <Card.Body className="py-5">
                  <h5 className="fw-bold text-muted mb-3">No Accepted Matches Yet</h5>
                  <p className="text-muted mb-4">
                    Accept matches to view them here and start a conversation.
                  </p>
                  <Link href="/matches" passHref legacyBehavior>
                    <Button variant="success">Browse Matches</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        {!error && acceptedMatches.length > 0 && (
          <Row className="g-4">
            {acceptedMatches.map((match) => (
              <Col key={match.id} xs={12} sm={6} lg={4}>
                <AcceptedMatchCard match={match} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </main>
  );
}
