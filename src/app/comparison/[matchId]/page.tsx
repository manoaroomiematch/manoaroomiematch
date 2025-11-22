/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/button-has-type */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ComparisonData } from '@/types';
import SideBySideComparison from '@/components/SideBySideComparison';
import CompatibilityReportBox from '@/components/CompatibilityReport';
import IcebreakersBox from '@/components/Icebreakers';

export default function ComparisonPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.matchId as string;
  const userId = searchParams.get('userId');

  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComparison() {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/matches/${matchId}/comparison?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch comparison data');

        const comparisonData = await res.json();
        setData(comparisonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [matchId, userId]);

  if (loading) {
    return (
      <main className="bg-light min-vh-100">
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading comparison...</p>
          </div>
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
              <Card className="shadow-sm border-0">
                <Card.Body className="text-center p-5">
                  <div className="text-danger mb-3">
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem' }} />
                  </div>
                  <h2>Error Loading Match</h2>
                  <p className="text-muted">{error || 'No data available'}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    );
  }

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
            />
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
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Button variant="success" size="lg" className="px-5">
                Accept Match
              </Button>
              <Button variant="outline-secondary" size="lg" className="px-5">
                Save for Later
              </Button>
              <Button variant="outline-danger" size="lg" className="px-5">
                Pass
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
