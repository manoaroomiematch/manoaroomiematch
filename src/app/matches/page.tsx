/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, ButtonGroup, Button, Alert } from 'react-bootstrap';
import { Grid3x3GapFill, ListUl } from 'react-bootstrap-icons';
import { Match, UserProfile } from '@prisma/client';
import { useSession } from 'next-auth/react';
import MatchCard, { MatchData } from '@/components/MatchCard';

/**
 * BrowseMatches Page Component
 *
 * Main page for displaying roommate matches in either grid or list view.
 * Features:
 * - Toggle between grid and list layouts
 * - Display match cards with profile info
 * - Responsive design for mobile/desktop
 * - Fetches real matches from the API with loading and error states
 *
 * TODO: Add filtering options (by major, traits, match percentage, etc.)
 * TODO: Add sorting options (by match percentage, name, etc.)
 * TODO: Add pagination or infinite scroll for large datasets
 */

type MatchWithProfiles = Match & { user1: UserProfile; user2: UserProfile };

const sleepLabels = ['Early Bird', 'Morning Person', 'Flexible', 'Evening Person', 'Night Owl'];
const cleanlinessLabels = ['Relaxed', 'Casual', 'Moderate', 'Tidy', 'Very Clean'];
const socialLabels = ['Homebody', 'Occasional', 'Balanced', 'Social', 'Very Social'];

const getLabel = (labels: string[], value?: number | null) => {
  if (!value) return null;
  return labels[value - 1] || null;
};

const buildTraits = (profile: UserProfile) => {
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
    name: otherUser.name,
    major: otherUser.major || 'Major not specified',
    traits: traits.length > 0 ? traits : ['No traits available'],
    matchPercentage: match.overallScore,
    photoUrl: otherUser.photoUrl || undefined,
  };
};

/**
 * Main BrowseMatches Component
 * Renders the match browsing interface with view toggle
 */
const BrowseMatches: React.FC = () => {
  const { status } = useSession();
  // State to track current view mode (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  const fetchMatches = useMemo(
    () => async () => {
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

        setCurrentProfileId(profileId);

        const formattedMatches = apiMatches
          .map((match) => buildMatchCard(match, profileId))
          .filter((match): match is MatchData => match !== null);

        setMatches(formattedMatches);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load matches';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMatches();
    }

    if (status === 'unauthenticated') {
      setError('Please sign in to view your matches.');
    }
  }, [fetchMatches, status]);

  if (status === 'loading' || loading) {
    return (
      <main>
        <Container className="py-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading matches...</span>
          </div>
          <p className="mt-3">Loading matches...</p>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container fluid className="py-4">
        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Page Header with View Toggle */}
        <Row className="mb-4 align-items-center">
          <Col xs={12} md={6}>
            <h1 className="mb-3 mb-md-0">Browse Matches</h1>
          </Col>
          <Col xs={12} md={6} className="text-md-end">
            {/* Toggle between grid and list view */}
            <ButtonGroup aria-label="View mode toggle">
              <Button
                variant={viewMode === 'grid' ? 'success' : 'outline-success'}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3x3GapFill className="me-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'success' : 'outline-success'}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <ListUl className="me-2" />
                List
              </Button>
            </ButtonGroup>
          </Col>
        </Row>

        {/* TODO: Add filter/sort controls here */}
        {/* Example: Filter by major, traits, match percentage range */}

        {/* Matches Display Area */}
        <Row className={viewMode === 'grid' ? 'g-4' : 'g-3'}>
          {matches.length > 0 ? (
            matches.map((match) => (
              <Col
                key={match.id}
                xs={12}
                sm={viewMode === 'grid' ? 6 : 12}
                md={viewMode === 'grid' ? 6 : 12}
                lg={viewMode === 'grid' ? 4 : 12}
              >
                <MatchCard match={match} viewMode={viewMode} />
              </Col>
            ))
          ) : (
            // Empty state when no matches are found
            <Col xs={12} className="text-center py-5">
              <p className="text-muted">
                {currentProfileId
                  ? 'No matches found. Try adjusting your preferences!'
                  : 'No matches to display yet.'}
              </p>
              {/* TODO: Add link to preferences/profile page */}
            </Col>
          )}
        </Row>

        {/* TODO: Add pagination controls here if needed */}
        {/* Example: Show 12 matches per page with pagination buttons */}
      </Container>
    </main>
  );
};

export default BrowseMatches;
