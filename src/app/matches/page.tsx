/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useState } from 'react';
import { Container, Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import { Grid3x3GapFill, ListUl } from 'react-bootstrap-icons';
import MatchCard, { MatchData } from '@/components/MatchCard';

/**
 * BrowseMatches Page Component
 *
 * Main page for displaying roommate matches in either grid or list view.
 * Features:
 * - Toggle between grid and list layouts
 * - Display match cards with profile info
 * - Responsive design for mobile/desktop
 *
 * TODO: Replace mock data with actual API call to fetch matches from database
 * TODO: Add filtering options (by major, traits, match percentage, etc.)
 * TODO: Add sorting options (by match percentage, name, etc.)
 * TODO: Add pagination or infinite scroll for large datasets
 * TODO: Add loading state while fetching data
 * TODO: Add error handling for failed data fetches
 */

/**
 * MOCK DATA - Placeholder for development
 * TODO: Remove this once the backend API endpoint is ready
 * Expected API endpoint: /api/matches or similar
 * Expected response format: Array<MatchData>
 */
const mockMatches: MatchData[] = [
  {
    id: 1,
    name: 'Kai Nakamura',
    major: 'Computer Science',
    traits: ['Night Owl', 'Tidy', 'Introvert'],
    matchPercentage: 92,
    // photoUrl: '/images/profiles/kai.jpg', // Uncomment when images are available
  },
  {
    id: 2,
    name: 'Leilani Santos',
    major: 'Biology',
    traits: ['Early Bird', 'Clean', 'Friendly'],
    matchPercentage: 88,
    // photoUrl: '/images/profiles/leilani.jpg',
  },
  {
    id: 3,
    name: 'Noa Tanaka',
    major: 'Business',
    traits: ['Organized', 'Social', 'Gym Enthusiast'],
    matchPercentage: 85,
    // photoUrl: '/images/profiles/noa.jpg',
  },
  {
    id: 4,
    name: 'Makani Lee',
    major: 'Engineering',
    traits: ['Studious', 'Quiet', 'Morning Person'],
    matchPercentage: 78,
  },
  {
    id: 5,
    name: 'Alana Wong',
    major: 'Psychology',
    traits: ['Creative', 'Easygoing', 'Music Lover'],
    matchPercentage: 75,
  },
  {
    id: 6,
    name: 'Kenji Martinez',
    major: 'Marine Biology',
    traits: ['Adventurous', 'Outdoorsy', 'Flexible'],
    matchPercentage: 72,
  },
];

/**
 * Main BrowseMatches Component
 * Renders the match browsing interface with view toggle
 */
const BrowseMatches: React.FC = () => {
  // State to track current view mode (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /**
   * TODO: Implement actual data fetching
   * Example using useEffect and fetch:
   *
   * const [matches, setMatches] = useState<MatchData[]>([]);
   * const [loading, setLoading] = useState(true);
   * const [error, setError] = useState<string | null>(null);
   *
   * useEffect(() => {
   *   const fetchMatches = async () => {
   *     try {
   *       const response = await fetch('/api/matches');
   *       if (!response.ok) throw new Error('Failed to fetch matches');
   *       const data = await response.json();
   *       setMatches(data);
   *     } catch (err) {
   *       setError(err.message);
   *     } finally {
   *       setLoading(false);
   *     }
   *   };
   *   fetchMatches();
   * }, []);
   */

  // Currently using mock data
  const matches = mockMatches;

  return (
    <main>
      <Container fluid className="py-4">
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
              <p className="text-muted">No matches found. Try adjusting your preferences!</p>
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
