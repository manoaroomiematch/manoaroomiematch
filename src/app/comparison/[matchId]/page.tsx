/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/button-has-type */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  Col,
  Container,
  Row,
  Button,
  ListGroup,
  Alert,
  Modal,
} from 'react-bootstrap';
import { MatchDetailData, UserProfile } from '@/types';
import SideBySideComparison from '@/components/SideBySideComparison';
import CompatibilityReportBox from '@/components/CompatibilityReport';
import IcebreakersBox from '@/components/Icebreakers';
import UserProfileModal from '@/components/UserProfileModal';
import { saveMatchAction, getMatchAction } from '@/lib/matchActions';

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

export default function ComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { data: session, status } = useSession();

  const [data, setData] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [profileLoading, setProfileLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalMessage, setActionModalMessage] = useState('');
  const [lastAction, setLastAction] = useState<{ type: string; matchId: string } | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComparison() {
      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        setError('Please sign in to view matches');
        setLoading(false);
        return;
      }

      // Admins don't have access to the comparison page
      if (session?.user?.randomKey === 'ADMIN') {
        setError('Admins do not have access to match comparisons');
        setLoading(false);
        return;
      }

      try {
        console.log('[Comparison Page] Fetching match:', matchId);

        // Make API call WITHOUT userId parameter - API will use session
        const res = await fetch(`/api/matches/${matchId}`);

        console.log('[Comparison Page] Response status:', res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error('[Comparison Page] API error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch comparison data');
        }

        const comparisonData = await res.json();
        console.log('[Comparison Page] Data received:', comparisonData);
        setData(comparisonData as MatchDetailData);
      } catch (err) {
        console.error('[Comparison Page] Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [matchId, status, session?.user?.randomKey]);

  // Check current match status from localStorage
  useEffect(() => {
    const currentStatus = getMatchAction(matchId);
    setMatchStatus(currentStatus);
  }, [matchId]);

  const handleViewProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      const { profile, userId: reportingUserId } = await res.json();

      // Convert Prisma UserProfile to ProfileData format (null to undefined)
      const profileData: ProfileData = {
        ...profile,
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        pronouns: profile.pronouns || undefined,
        bio: profile.bio || undefined,
        photoUrl: profile.photoUrl || undefined,
        major: profile.major || undefined,
        classStanding: profile.classStanding || undefined,
        graduationYear: profile.graduationYear || undefined,
      };

      setSelectedProfile(profileData);
      setSelectedUserId(reportingUserId);
      setShowProfileModal(true);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
    setSelectedUserId(undefined);
  };

  const handleUndo = () => {
    if (lastAction) {
      const { type } = lastAction;
      // Remove the action from localStorage
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
          console.error('Error undoing action:', e);
        }
      }

      setActionModalMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} cancelled.`);
      setLastAction(null);
      setCanUndo(false);
      setIsConfirming(false);
    }
  };

  const handleConfirmAction = () => {
    if (lastAction?.type === 'accept') {
      router.push(`/messages?matchId=${matchId}`);
    } else if (lastAction?.type === 'save') {
      router.push('/saved-matches');
    } else if (lastAction?.type === 'pass') {
      router.push('/matches');
    } else if (lastAction?.type === 'unmatch') {
      router.push('/accepted-matches');
    }
    setShowActionModal(false);
  };

  const getModalTitle = () => {
    if (actionModalMessage.includes('Error')) return '⚠️ Error';
    if (isConfirming) return '✓ Confirm';
    return '';
  };

  const handleAcceptMatch = async () => {
    setActionLoading(true);
    try {
      saveMatchAction(matchId, 'accepted');
      setLastAction({ type: 'accept', matchId });
      setCanUndo(true);
      setActionModalMessage('Match accepted! Ready to start messaging?');
      setIsConfirming(true);
      setShowActionModal(true);
    } catch (err) {
      console.error('Error accepting match:', err);
      setActionModalMessage('Error accepting match. Please try again.');
      setIsConfirming(false);
      setShowActionModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveForLater = async () => {
    setActionLoading(true);
    try {
      saveMatchAction(matchId, 'saved');
      setLastAction({ type: 'save', matchId });
      setCanUndo(true);
      setActionModalMessage('Match saved! You can view it anytime.');
      setIsConfirming(true);
      setShowActionModal(true);
    } catch (err) {
      console.error('Error saving match:', err);
      setActionModalMessage('Error saving match. Please try again.');
      setIsConfirming(false);
      setShowActionModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePassMatch = async () => {
    setActionLoading(true);
    try {
      saveMatchAction(matchId, 'passed');
      setLastAction({ type: 'pass', matchId });
      setCanUndo(true);
      setActionModalMessage('You\'ve passed on this match. They won\'t appear in your matches again.');
      setIsConfirming(true);
      setShowActionModal(true);
    } catch (err) {
      console.error('Error passing match:', err);
      setActionModalMessage('Error passing match. Please try again.');
      setIsConfirming(false);
      setShowActionModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnmatch = async () => {
    setActionLoading(true);
    try {
      saveMatchAction(matchId, 'passed');
      setLastAction({ type: 'unmatch', matchId });
      setCanUndo(true);
      setActionModalMessage('Match removed from your accepted matches.');
      setIsConfirming(true);
      setShowActionModal(true);
    } catch (err) {
      console.error('Error removing match:', err);
      setActionModalMessage('Error removing match. Please try again.');
      setIsConfirming(false);
      setShowActionModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="bg-light min-vh-100">
        <Container className="py-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading comparison...</p>
        </Container>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="bg-light min-vh-100">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="danger">
                <Alert.Heading>Error Loading Match</Alert.Heading>
                <p>{error || 'No data available'}</p>
                <hr />
                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" href="/matches">
                    Back to Matches
                  </Button>
                  <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
      </main>
    );
  }

  const renderActionButtons = () => {
    if (matchStatus === 'accepted') {
      return (
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-4 flex-wrap">
          <Button
            variant="success"
            size="lg"
            className="px-5"
            disabled
            title="You already accepted this match"
          >
            Accept Match ✓
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="px-5"
            onClick={handleSaveForLater}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Save for Later'}
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="px-5"
            onClick={handlePassMatch}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Pass'}
          </Button>
          <Button
            variant="outline-dark"
            size="lg"
            className="px-5"
            onClick={handleUnmatch}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Unmatch'}
          </Button>
        </div>
      );
    }

    if (matchStatus === 'saved') {
      return (
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-4 flex-wrap">
          <Button
            variant="success"
            size="lg"
            className="px-5"
            onClick={handleAcceptMatch}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Accept Match'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="px-5"
            disabled
            title="You already saved this match"
          >
            Save for Later ✓
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="px-5"
            onClick={handlePassMatch}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Pass'}
          </Button>
        </div>
      );
    }

    if (matchStatus === 'passed') {
      return (
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-4 flex-wrap">
          <Button
            variant="success"
            size="lg"
            className="px-5"
            onClick={handleAcceptMatch}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Accept Match'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="px-5"
            onClick={handleSaveForLater}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Save for Later'}
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="px-5"
            disabled
            title="You already passed on this match"
          >
            Pass ✓
          </Button>
        </div>
      );
    }

    // Default: no action taken yet
    return (
      <div className="d-flex flex-column flex-sm-row justify-content-center gap-4 flex-wrap">
        <Button
          variant="success"
          size="lg"
          className="px-5"
          onClick={handleAcceptMatch}
          disabled={actionLoading}
        >
          {actionLoading ? 'Processing...' : 'Accept Match'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="px-5"
          onClick={handleSaveForLater}
          disabled={actionLoading}
        >
          {actionLoading ? 'Processing...' : 'Save for Later'}
        </Button>
        <Button
          variant="danger"
          size="lg"
          className="px-5"
          onClick={handlePassMatch}
          disabled={actionLoading}
        >
          {actionLoading ? 'Processing...' : 'Pass'}
        </Button>
      </div>
    );
  };

  return (
    <main className="bg-light py-4">
      <Container className="py-4 pb-5 mb-5">
        {/* Page Title with Score */}
        <Row className="justify-content-center mb-4">
          <Col md={10} lg={8} className="text-center">
            <Card className="shadow border-success border-2 mb-4" style={{ borderRadius: '50px' }}>
              <Card.Body className="py-3 px-5">
                <div className="d-flex align-items-center justify-content-center gap-3">
                  <h1 className="display-3 fw-bold text-success mb-0">
                    {data.match.overallScore}
                    %
                  </h1>
                  <div className="text-start">
                    <div className="text-muted small">Overall</div>
                    <div className="text-muted small">Compatibility</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <h1 className="fw-bold mb-2">Match Details</h1>
            <p className="text-muted">Review your compatibility analysis and conversation starters</p>
          </Col>
        </Row>

        {/* Side-by-Side Comparison */}
        <Row className="mb-4">
          <Col>
            <SideBySideComparison
              currentUser={data.currentUser}
              matchUser={data.matchUser}
              categoryBreakdown={data.categoryBreakdown}
              overallScore={data.match.overallScore}
              onViewProfile={handleViewProfile}
            />
          </Col>
        </Row>

        <Row className="mb-4 g-4">
          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center rounded"
                    style={{ width: '44px', height: '44px' }}
                  >
                    <i className="bi bi-hand-thumbs-up" />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Compatible Traits</h5>
                    <small className="text-muted">Where your lifestyles naturally align</small>
                  </div>
                </div>
                {data.compatibleTraits.length > 0 ? (
                  <ListGroup variant="flush">
                    {data.compatibleTraits.map((trait, index) => (
                      <ListGroup.Item key={trait + index} className="px-0">
                        <i className="bi bi-check-circle text-success me-2" />
                        {trait}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted mb-0">No strong alignments identified yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center rounded"
                    style={{ width: '44px', height: '44px' }}
                  >
                    <i className="bi bi-exclamation-triangle" />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Potential Conflicts</h5>
                    <small className="text-muted">Areas to discuss early</small>
                  </div>
                </div>
                {data.conflicts.length > 0 ? (
                  <ListGroup variant="flush">
                    {data.conflicts.map((conflict, index) => (
                      <ListGroup.Item key={conflict + index} className="px-0">
                        <i className="bi bi-dot text-danger me-2" />
                        {conflict}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted mb-0">No major conflicts detected.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Two Column Layout for Report and Icebreakers */}
        <Row className="g-4 mb-4">
          <Col lg={6}>
            <CompatibilityReportBox
              matchId={matchId}
              report={data.match.compatibilityReport || undefined}
            />
          </Col>
          <Col lg={6}>
            <IcebreakersBox
              matchId={matchId}
              icebreakers={data.match.icebreakers}
            />
          </Col>
        </Row>

        {/* Action buttons */}
        <Row className="mt-4">
          <Col className="text-center">
            {renderActionButtons()}
          </Col>
        </Row>
      </Container>

      {/* Profile Modal */}
      <UserProfileModal
        profile={selectedProfile}
        show={showProfileModal}
        onHide={handleCloseModal}
        userId={selectedUserId}
      />

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={() => !isConfirming && setShowActionModal(false)} centered backdrop={isConfirming ? 'static' : true} keyboard={!isConfirming}>
        <Modal.Header closeButton={!isConfirming}>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{actionModalMessage}</Modal.Body>
        <Modal.Footer>
          {isConfirming && canUndo && !actionModalMessage.includes('Error') && (
            <Button variant="outline-secondary" onClick={handleUndo}>
              Undo
            </Button>
          )}
          {isConfirming && !actionModalMessage.includes('Error') ? (
            <Button variant="success" onClick={handleConfirmAction}>
              Okay
            </Button>
          ) : (
            <Button
              variant={actionModalMessage.includes('Error') ? 'danger' : 'secondary'}
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
