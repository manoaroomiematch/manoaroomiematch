'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Card,
  Modal,
} from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, PersonCircle, Star, StarFill } from 'react-bootstrap-icons';
import { getSavedMatches, getPassedMatches, saveMatchAction } from '@/lib/matchActions';

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
  };
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

interface SavedMatchCardProps {
  match: MatchData;
  onAccept: (matchId: string) => void;
  onRemove: (matchId: string) => void;
  isLoading: boolean;
}

const SavedMatchCard: React.FC<SavedMatchCardProps> = ({
  match,
  onAccept,
  onRemove,
  isLoading,
}) => {
  const isHighMatch = match.matchPercentage >= 80;

  return (
    <Card className="match-card match-card-grid shadow-sm h-100 position-relative">
      {/* Delete Button */}
      <button
        type="button"
        className="btn btn-sm btn-close position-absolute top-0 end-0 m-2"
        onClick={() => onRemove(match.id)}
        disabled={isLoading}
        style={{ zIndex: 10 }}
        aria-label="Remove from saved"
      />

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

        {/* Action Buttons */}
        <div className="mt-auto d-flex gap-2 flex-column">
          <Link href={`/comparison/${match.id}`} passHref legacyBehavior>
            <Button variant="outline-primary" size="sm" className="w-100">
              View Details
            </Button>
          </Link>
          <Button
            variant="success"
            size="sm"
            className="w-100"
            onClick={() => onAccept(match.id)}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Accept'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default function SavedMatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [savedMatches, setSavedMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalMessage, setActionModalMessage] = useState('');
  const [lastAction, setLastAction] = useState<{ type: string; matchId: string } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleUndo = () => {
    if (lastAction) {
      const { type, matchId } = lastAction;
      const actions = new Map();
      const stored = localStorage.getItem('match-actions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Array<{ matchId: string; action: string }>;
          parsed.forEach((a) => {
            if (a.matchId !== matchId) {
              actions.set(a.matchId, a.action);
            }
          });
          // If undoing accept, restore as saved
          if (type === 'accept') {
            actions.set(matchId, 'saved');
          }
          localStorage.setItem(
            'match-actions',
            JSON.stringify(Array.from(actions.entries()).map(([id, action]) => ({
              matchId: id,
              action,
              timestamp: Date.now(),
            }))),
          );
        } catch (e) {
          console.error('Error undoing action:', e);
        }
      }

      // If undoing a remove, re-fetch to restore the match to the list
      if (type === 'remove' || type === 'accept') {
        const fetchUndo = async () => {
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
            const savedMatchIds = getSavedMatches();
            const passedMatchIds = getPassedMatches();
            const filtered = apiMatches
              .filter((match) => savedMatchIds.includes(match.id) && !passedMatchIds.includes(match.id))
              .map((match) => buildMatchCard(match, profileId))
              .filter((match): match is MatchData => match !== null);
            setSavedMatches(filtered);
          } catch (err) {
            console.error('Error refetching after undo:', err);
          }
        };
        fetchUndo();
      }
    }

    setIsConfirming(false);
    setShowActionModal(false);
    setLastAction(null);
  };

  const handleAccept = (matchId: string) => {
    try {
      saveMatchAction(matchId, 'accepted');
      setLastAction({ type: 'accept', matchId });
      setIsConfirming(true);
      setActionModalMessage('Match accepted! Ready to start messaging?');
      setShowActionModal(true);
    } catch (err) {
      console.error('Error accepting match:', err);
      setActionModalMessage('Error accepting match. Please try again.');
      setShowActionModal(true);
    }
  };

  const handleRemove = (matchId: string) => {
    try {
      // Remove from saved matches
      const actions = new Map();
      const stored = localStorage.getItem('match-actions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Array<{ matchId: string; action: string }>;
          parsed.forEach((a) => {
            if (a.matchId !== matchId) {
              actions.set(a.matchId, a.action);
            }
          });
          localStorage.setItem(
            'match-actions',
            JSON.stringify(Array.from(actions.entries()).map(([id, action]) => ({
              matchId: id,
              action,
              timestamp: Date.now(),
            }))),
          );
        } catch (e) {
          console.error('Error removing match:', e);
        }
      }

      setLastAction({ type: 'remove', matchId });
      setIsConfirming(true);
      setActionModalMessage('Removed from saved matches.');
      setShowActionModal(true);
    } catch (err) {
      console.error('Error removing match:', err);
      setActionModalMessage('Error removing match. Please try again.');
      setShowActionModal(true);
    }
  };

  const handleConfirmAction = () => {
    if (lastAction?.type === 'accept') {
      router.push(`/messages?matchId=${lastAction.matchId}`);
    } else if (lastAction?.type === 'remove') {
      setSavedMatches(savedMatches.filter((m) => m.id !== lastAction.matchId));
    }
    setShowActionModal(false);
  };

  const getModalTitle = () => {
    if (!isConfirming) return 'Confirmation';
    return actionModalMessage.includes('Error') ? '⚠️ Error' : '✓ Success';
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      setError('Please sign in to view your saved matches.');
      setLoading(false);
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    const fetchSavedMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get all matches
        const response = await fetch('/api/matches');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load matches');
        }

        const { matches: apiMatches, currentProfileId: profileId } = payload as {
          matches: MatchWithProfiles[];
          currentProfileId: string | null;
        };

        // Get saved match IDs from localStorage
        const savedMatchIds = getSavedMatches();
        const passedMatchIds = getPassedMatches();

        // Filter to only saved matches
        const filtered = apiMatches
          .filter((match) => savedMatchIds.includes(match.id) && !passedMatchIds.includes(match.id))
          .map((match) => buildMatchCard(match, profileId))
          .filter((match): match is MatchData => match !== null);

        setSavedMatches(filtered);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load saved matches';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedMatches();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <main className="bg-light min-vh-100">
        <Container className="pt-3 pb-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your saved matches...</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="match-pages-background">
      <Container className="pt-1 pb-5">
        <Row className="mb-3">
          <Col>
            <Link href="/matches" passHref legacyBehavior>
              <Button variant="outline-secondary" className="mb-3">
                <ArrowLeft className="me-2" size={18} />
                Back to Browse
              </Button>
            </Link>
            <h1 className="fw-bold">Saved Matches</h1>
            <p className="text-muted">Your collection of matches to explore later</p>
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

        {!error && savedMatches.length === 0 && (
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="text-center shadow-sm">
                <Card.Body className="py-5">
                  <h5 className="fw-bold text-muted mb-3">No Saved Matches Yet</h5>
                  <p className="text-muted mb-4">
                    Visit the browse page and save matches to view them here anytime.
                  </p>
                  <Link href="/matches" passHref legacyBehavior>
                    <Button variant="success">Browse Matches</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {!error && savedMatches.length > 0 && (
          <Row className="g-4">
            {savedMatches.map((match) => (
              <Col key={match.id} xs={12} sm={6} lg={4}>
                <SavedMatchCard
                  match={match}
                  onAccept={handleAccept}
                  onRemove={handleRemove}
                  isLoading={false}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Action Modal */}
      <Modal
        show={showActionModal}
        onHide={() => !isConfirming && setShowActionModal(false)}
        centered
        backdrop={isConfirming ? 'static' : true}
        keyboard={!isConfirming}
      >
        <Modal.Header closeButton={!isConfirming}>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{actionModalMessage}</Modal.Body>
        <Modal.Footer>
          {isConfirming ? (
            <>
              <Button variant="outline-secondary" onClick={handleUndo}>
                Undo
              </Button>
              <Button variant="success" onClick={handleConfirmAction}>
                Okay
              </Button>
            </>
          ) : (
            <Button
              variant={actionModalMessage.includes('Error') ? 'danger' : 'success'}
              onClick={() => setShowActionModal(false)}
            >
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </main>
  );
}
