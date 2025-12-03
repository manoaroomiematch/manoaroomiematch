/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { Card, Button } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import Image from 'next/image';
import Link from 'next/link';

/**
 * QuickMatchesList Component
 *
 * Displays a list of quick match previews with:
 * - Match profile photo
 * - Name and school
 * - View button to see detailed profile
 * - Link to browse all matches
 *
 * TODO: Connect to actual match data from database
 * TODO: Sort by compatibility score
 * TODO: Limit to top 3-5 matches
 */

interface QuickMatch {
  id: string;
  name: string;
  school: string;
  photoUrl?: string;
}

interface QuickMatchesListProps {
  matches: QuickMatch[];
}

const QuickMatchesList: React.FC<QuickMatchesListProps> = ({ matches }) => (
  <Card className="quick-matches-list shadow-sm">
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-bold">Your Matches</h4>
        <Link
          href="/matches"
          className="text-success text-decoration-none small"
        >
          View All →
        </Link>
      </div>

      {/* Matches List */}
      <div className="matches-list d-flex flex-column gap-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="match-item d-flex align-items-center justify-content-between p-3 bg-light rounded"
          >
            {/* Match Info */}
            <div className="d-flex align-items-center">
              <div className="me-3">
                {match.photoUrl ? (
                  <Image
                    src={match.photoUrl}
                    alt={`${match.name} profile photo`}
                    width={50}
                    height={50}
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <PersonCircle size={50} className="text-secondary" />
                )}
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{match.name}</h6>
                <p className="text-muted small mb-0">{match.school}</p>
              </div>
            </div>

            {/* View Button */}
            <Link href={`/comparison/${match.id}`} passHref legacyBehavior>
              <Button
                variant="success"
                size="sm"
              >
                View
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {matches.length === 0 && (
        <div className="text-center py-4 text-muted">
          <p>No matches yet!</p>
          <p className="small">Complete your lifestyle survey to find compatible roommates.</p>
          <Link href="/lifestyle-survey">
            <Button variant="outline-success" size="sm">
              Take Survey
            </Button>
          </Link>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default QuickMatchesList;
