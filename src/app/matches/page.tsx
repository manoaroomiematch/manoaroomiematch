'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { Grid3x3GapFill, ListUl } from 'react-bootstrap-icons';
import MatchCard, { MatchData } from '@/components/MatchCard';

const BrowseMatches: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        const response = await fetch('/api/matches?sort=score&order=desc');

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();

        // Transform API response to match MatchData interface
        const formattedMatches = data.matches.map((match: any) => ({
          id: parseInt(match.id, 10), // MatchCard expects number
          name: match.name,
          major: match.major,
          traits: match.traits,
          matchPercentage: match.matchPercentage,
          photoUrl: match.photoUrl,
        }));

        setMatches(formattedMatches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <main>
        <Container fluid className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3">Loading matches...</p>
          </div>
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Container fluid className="py-4">
          <div className="text-center py-5">
            <p className="text-danger">{error}</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container fluid className="py-4">
        <Row className="mb-4 align-items-center">
          <Col xs={12} md={6}>
            <h1 className="mb-3 mb-md-0">Browse Matches</h1>
          </Col>
          <Col xs={12} md={6} className="text-md-end">
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
            <Col xs={12} className="text-center py-5">
              <p className="text-muted">No matches found yet!</p>
              <p className="small">Complete your lifestyle survey to find compatible roommates.</p>
            </Col>
          )}
        </Row>
      </Container>
    </main>
  );
};

export default BrowseMatches;
