'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, ButtonGroup, Button, Alert, Form } from 'react-bootstrap';
import { Grid3x3GapFill, ListUl } from 'react-bootstrap-icons';
import { Match, UserProfile } from '@prisma/client';
import { useSession } from 'next-auth/react';
import MatchCard, { MatchData } from '@/components/MatchCard';
import MatchFilterPanel, { MatchFilters, DEFAULT_FILTERS } from '@/components/MatchFilters';

/**
 * BrowseMatches Page Component
 *
 * Main page for displaying roommate matches in either grid or list view.
 * Features:
 * - Toggle between grid and list layouts
 * - Display match cards with profile info
 * - Responsive design for mobile/desktop
 * - Fetches real matches from the API with loading and error states
 * - Advanced filtering and sorting
 */

type MatchWithProfiles = Match & { user1: UserProfile; user2: UserProfile };
type ExtendedMatchData = MatchData & { profile: UserProfile };

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
): ExtendedMatchData | null => {
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
    profile: otherUser, // Include full profile for filtering
  };
};

/**
 * Main BrowseMatches Component
 * Renders the match browsing interface with view toggle, filters, and sorting
 */
const BrowseMatches: React.FC = () => {
  const { status } = useSession();
  // State to track current view mode (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [matches, setMatches] = useState<ExtendedMatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<MatchFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('match-desc');

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
          .filter((match): match is ExtendedMatchData => match !== null);

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

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('match-filters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (err) {
        console.error('Failed to load saved filters:', err);
      }
    }
  }, []);

  // Filter and sort matches
  const filteredAndSortedMatches = useMemo(() => {
    let result = [...matches];

    // Apply filters
    result = result.filter((match) => {
      const { profile } = match;

      // Match percentage filter
      if (match.matchPercentage < filters.minMatchPercentage) {
        return false;
      }

      // Pronouns filter (multi-select)
      if (filters.pronouns.length > 0 && profile.pronouns) {
        const lowerPronouns = profile.pronouns.toLowerCase();
        const hasMatch = filters.pronouns.some(
          (filterPronouns) => lowerPronouns.includes(filterPronouns.toLowerCase()),
        );
        if (!hasMatch) {
          return false;
        }
      }

      // Housing type filter (multi-select)
      if (filters.housingType.length > 0 && profile.housingType) {
        if (!filters.housingType.includes(profile.housingType)) {
          return false;
        }
      }

      // Preferred dorm filter (multi-select)
      if (filters.preferredDorm.length > 0 && profile.preferredDorm) {
        if (!filters.preferredDorm.includes(profile.preferredDorm)) {
          return false;
        }
      }

      // Class standing filter (multi-select)
      if (filters.classStanding.length > 0 && profile.classStanding) {
        if (!filters.classStanding.includes(profile.classStanding)) {
          return false;
        }
      }

      // Major filter (search)
      if (filters.major && profile.major) {
        if (!profile.major.toLowerCase().includes(filters.major.toLowerCase())) {
          return false;
        }
      }

      // Sleep schedule filter (multi-select)
      if (filters.sleepSchedule.length > 0 && profile.sleepSchedule) {
        const sleepMap: Record<string, number[]> = {
          'early-bird': [1],
          morning: [2],
          flexible: [3],
          evening: [4],
          'night-owl': [5],
        };
        const hasMatch = filters.sleepSchedule.some((filterValue) => {
          const validValues = sleepMap[filterValue];
          return validValues && validValues.includes(profile.sleepSchedule);
        });
        if (!hasMatch) {
          return false;
        }
      }

      // Cleanliness filter (multi-select)
      if (filters.cleanliness.length > 0 && profile.cleanliness) {
        const cleanMap: Record<string, number[]> = {
          relaxed: [1],
          casual: [2],
          moderate: [3],
          tidy: [4],
          'very-clean': [5],
        };
        const hasMatch = filters.cleanliness.some((filterValue) => {
          const validValues = cleanMap[filterValue];
          return validValues && validValues.includes(profile.cleanliness);
        });
        if (!hasMatch) {
          return false;
        }
      }

      // Social level filter (multi-select)
      if (filters.socialLevel.length > 0 && profile.socialLevel) {
        const socialMap: Record<string, number[]> = {
          homebody: [1],
          occasional: [2],
          balanced: [3],
          social: [4],
          'very-social': [5],
        };
        const hasMatch = filters.socialLevel.some((filterValue) => {
          const validValues = socialMap[filterValue];
          return validValues && validValues.includes(profile.socialLevel);
        });
        if (!hasMatch) {
          return false;
        }
      }

      // Smoking filter (multi-select)
      if (filters.smoking.length > 0) {
        const hasMatch = filters.smoking.some((filterValue) => {
          const expectsSmoking = filterValue === 'yes';
          return profile.smoking === expectsSmoking;
        });
        if (!hasMatch) {
          return false;
        }
      }

      // Pets filter (multi-select)
      if (filters.pets.length > 0) {
        const hasMatch = filters.pets.some((filterValue) => {
          const expectsPets = filterValue === 'yes';
          return profile.pets === expectsPets;
        });
        if (!hasMatch) {
          return false;
        }
      }

      // Budget filter (multi-select, approximate parsing)
      if (filters.budget.length > 0 && profile.budget) {
        const budgetValue = parseInt(profile.budget.replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(budgetValue)) {
          const budgetRanges: Record<string, [number, number]> = {
            'under-500': [0, 499],
            '500-750': [500, 750],
            '750-1000': [751, 1000],
            '1000-1500': [1001, 1500],
            'over-1500': [1501, 999999],
          };
          const hasMatch = filters.budget.some((filterValue) => {
            const range = budgetRanges[filterValue];
            return range && budgetValue >= range[0] && budgetValue <= range[1];
          });
          if (!hasMatch) {
            return false;
          }
        }
      }

      // Move-in timeline filter (simplified - would need needRoommateBy date comparison)
      // Skipping for now as it requires date logic

      return true;
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'match-desc':
          return b.matchPercentage - a.matchPercentage;
        case 'match-asc':
          return a.matchPercentage - b.matchPercentage;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'class-desc':
          return (b.profile.classStanding || '').localeCompare(a.profile.classStanding || '');
        case 'class-asc':
          return (a.profile.classStanding || '').localeCompare(b.profile.classStanding || '');
        default:
          return b.matchPercentage - a.matchPercentage;
      }
    });

    return result;
  }, [matches, filters, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minMatchPercentage > 0) count += 1;
    if (filters.pronouns.length > 0) count += 1;
    if (filters.housingType.length > 0) count += 1;
    if (filters.preferredDorm.length > 0) count += 1;
    if (filters.classStanding.length > 0) count += 1;
    if (filters.major) count += 1;
    if (filters.sleepSchedule.length > 0) count += 1;
    if (filters.cleanliness.length > 0) count += 1;
    if (filters.socialLevel.length > 0) count += 1;
    if (filters.smoking.length > 0) count += 1;
    if (filters.pets.length > 0) count += 1;
    if (filters.budget.length > 0) count += 1;
    if (filters.moveInTimeline.length > 0) count += 1;
    return count;
  }, [filters]);

  // Filter handlers
  const handleFiltersChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    localStorage.removeItem('match-filters');
  };

  const handleSaveFilters = () => {
    localStorage.setItem('match-filters', JSON.stringify(filters));
  };

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

        {/* Page Header */}
        <Row className="mb-4 align-items-center">
          <Col xs={12} md={8}>
            <h1 className="mb-0">Browse Matches</h1>
          </Col>
          <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
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

        {/* Sort By */}
        <Row className="mb-3">
          <Col xs={12} md={6} lg={4}>
            <Form.Group>
              <Form.Label className="small fw-bold mb-1">Sort By:</Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="match-desc">Match % (High to Low)</option>
                <option value="match-asc">Match % (Low to High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="class-desc">Class Standing (Senior First)</option>
                <option value="class-asc">Class Standing (Freshman First)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Filter Panel */}
        <MatchFilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onSaveFilters={handleSaveFilters}
          activeFilterCount={activeFilterCount}
          matchCount={filteredAndSortedMatches.length}
          totalMatches={matches.length}
        />

        {/* Matches Grid/List */}
        <Row className={viewMode === 'grid' ? 'g-4' : 'g-3'}>
          {filteredAndSortedMatches.length > 0 ? (
            filteredAndSortedMatches.map((match) => (
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
              <p className="text-muted">
                {matches.length === 0
                  ? 'No matches found. Complete your lifestyle survey to find roommates!'
                  : 'No matches found with current filters. Try adjusting your filters.'}
              </p>
              {matches.length > 0 && activeFilterCount > 0 && (
                <Button variant="outline-success" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </Col>
          )}
        </Row>
      </Container>
    </main>
  );
};

export default BrowseMatches;
