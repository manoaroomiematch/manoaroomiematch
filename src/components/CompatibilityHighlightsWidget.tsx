/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { Card, Badge } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import Image from 'next/image';
import Link from 'next/link';

/**
 * CompatibilityHighlights Component
 *
 * Displays a featured compatibility match with:
 * - Match profile photo
 * - Name, school, and major
 * - Shared traits/preferences
 * - Overall compatibility percentage
 * - Link to view full profile
 *
 * TODO: Connect to actual best match data from database
 * TODO: Calculate compatibility based on user preferences
 */

interface CompatibilityHighlightsProps {
  matchName: string;
  matchSchool: string;
  matchMajor: string;
  matchPhotoUrl?: string;
  compatibilityScore: number; // Percentage 0-100
  sharedTraits: string[];
}

const CompatibilityHighlights: React.FC<CompatibilityHighlightsProps> = ({
  matchName,
  matchSchool,
  matchMajor,
  matchPhotoUrl,
  compatibilityScore,
  sharedTraits,
}) => (
  <Card className="compatibility-highlights shadow-sm h-100">
    <Card.Body className="p-4">
      <h4 className="mb-4 fw-bold">Compatibility Highlights</h4>

      {/* Featured Match Card */}
      <Card className="border-0 bg-light mb-4">
        <Card.Body className="p-3">
          {/* Match Profile Header */}
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              {matchPhotoUrl ? (
                <Image
                  src={matchPhotoUrl}
                  alt={`${matchName} profile photo`}
                  width={60}
                  height={60}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <PersonCircle size={60} className="text-secondary" />
              )}
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold">{matchName}</h5>
              <p className="text-muted small mb-0">{matchSchool}</p>
              <p className="text-muted small mb-0">{matchMajor}</p>
            </div>
          </div>

          {/* Shared Traits */}
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              {sharedTraits.map((trait) => (
                <Badge
                  key={trait}
                  bg="secondary"
                  className="px-2 py-1"
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {/* Edit Profile Link */}
          <Link
            href="/lifestyle-survey"
            className="text-success text-decoration-none small"
          >
            Edit Profile
          </Link>
        </Card.Body>
      </Card>

      {/* Compatibility Score Circle */}
      <div className="text-center mb-3">
        <div className="compatibility-circle mx-auto mb-2">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e9ecef"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#198754"
              strokeWidth="12"
              strokeDasharray={`${compatibilityScore * 3.14} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
            {/* Percentage text */}
            <text
              x="60"
              y="65"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="#198754"
            >
              {compatibilityScore}
              %
            </text>
          </svg>
        </div>
        <div className="text-muted small">
          Late-night routines in common
          <br />
          Quiet and focused environments
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default CompatibilityHighlights;
