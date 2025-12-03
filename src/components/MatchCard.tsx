/* eslint-disable react/jsx-indent, @typescript-eslint/indent */
/* eslint-disable react/prop-types */

'use client';

import { Card, Button } from 'react-bootstrap';
import { PersonCircle, Star, StarFill } from 'react-bootstrap-icons';
import Link from 'next/link';

/**
 * Interface for Match data structure
 * TODO: Update this interface once the Profile/Match model is defined in Prisma schema
 * This should match the actual database schema for user profiles
 */
interface MatchData {
  id: string;
  name: string;
  major: string;
  traits: string[]; // Array of traits like "Night Owl", "Tidy", "Introvert"
  matchPercentage: number; // Match percentage (0-100)
  photoUrl?: string; // Optional profile photo URL
}

/**
 * Props for MatchCard component
 * @param match - The match data to display
 * @param viewMode - Display mode: 'grid' or 'list'
 */
interface MatchCardProps {
  match: MatchData;
  viewMode: 'grid' | 'list';
}

/**
 * MatchCard Component
 *
 * Displays a single match profile card with:
 * - Profile photo (or placeholder)
 * - Name and major
 * - Key personality traits
 * - Match percentage
 * - Link to detailed profile view
 *
 * Adapts layout based on grid or list view mode
 *
 * @param match - Match profile data
 * @param viewMode - 'grid' for card layout, 'list' for horizontal layout
 */
const MatchCard: React.FC<MatchCardProps> = ({ match, viewMode }) => {
  // Determine if match percentage is high enough to show filled star
  const isHighMatch = match.matchPercentage >= 80;

  return (
    <Card className={`match-card ${viewMode === 'list' ? 'match-card-list' : 'match-card-grid'}`}>
      <div className={viewMode === 'list' ? 'd-flex flex-row' : ''}>
        {/* Profile Photo Section */}
        <div className={`match-photo-container ${viewMode === 'list' ? 'list-photo' : 'grid-photo'}`}>
          {match.photoUrl ? (
            // TODO: Replace with actual profile photo once image upload is implemented
            <Card.Img
              variant="top"
              src={match.photoUrl}
              alt={`${match.name} profile`}
              className="match-photo"
            />
          ) : (
            // Placeholder avatar icon when no photo is available
            <div className="match-photo-placeholder">
              <PersonCircle size={viewMode === 'list' ? 80 : 120} color="#ccc" />
            </div>
          )}
        </div>

        {/* Match Information Section */}
        <Card.Body className={viewMode === 'list' ? 'flex-grow-1' : ''}>
          {/* Name */}
          <Card.Title className="match-name">{match.name}</Card.Title>

          {/* Major/Department */}
          <Card.Subtitle className="mb-2 text-muted match-major">
            {match.major}
          </Card.Subtitle>

          {/* Personality Traits */}
          <Card.Text className="match-traits">
            {match.traits.join(' · ')}
          </Card.Text>

          {/* Match Percentage with Star Icon */}
          <div className="match-percentage">
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

          {/* View Details Button */}
          {/* Links to the match comparison page with detailed compatibility breakdown */}
          {/* TODO: Replace 'user-123' with actual current user ID from session/auth */}
          <Link href={`/comparison/${match.id}?userId=user-123`} passHref legacyBehavior>
            <Button variant="success" className="mt-3 w-100">
              View Details
            </Button>
          </Link>
        </Card.Body>
      </div>
    </Card>
  );
};

// Export the component and types for use in other files
export default MatchCard;
export type { MatchData, MatchCardProps };
