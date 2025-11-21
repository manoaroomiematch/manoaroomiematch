/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserProfileOverview from '@/components/UserProfileOverview';
import CompatibilityHighlightsWidget from '@/components/CompatibilityHighlightsWidget';
import QuickMatchesList from '@/components/QuickMatchesList';

/**
 * User Home Page
 *
 * Main dashboard for logged-in users showing:
 * - User profile overview with quick stats
 * - Compatibility highlights with best match
 * - Quick access to top matches
 *
 * Layout follows mockup with left sidebar (profile), and right sections
 * (compatibility highlights and matches list)
 *
 * PROTECTED ROUTE: Redirects to sign-in if user is not authenticated
 *
 * TODO: Fetch actual user data from session
 * TODO: Fetch matches from database
 * TODO: Add notifications section
 * TODO: Add loading states
 */

const UserHomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protect the page - redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <main>
        <Container className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </Container>
      </main>
    );
  }

  // Only render content if authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  // TODO: Replace with actual user data from session/database
  // Currently using mock data - integrate with session.user when user profile exists
  const currentUserEmail = session?.user?.email || 'Guest';
  const mockUserData = {
    name: currentUserEmail.split('@')[0] || 'Taylor-Marie Lee',
    school: 'University of Hawaiʻi at Mānoa',
    program: 'Biology',
    year: 'Junior',
    photoUrl: '', // Empty for now - will show placeholder
    surveyCompletion: 100,
    matchesFound: 12,
  };

  // TODO: Replace with actual best match data from database
  const mockBestMatch = {
    matchName: 'Taylor-Marie Lee',
    matchSchool: 'University of Hawaiʻi at Mānoa',
    matchMajor: 'Biology',
    matchPhotoUrl: '',
    compatibilityScore: 75,
    sharedTraits: ['Night Owl', 'Prefers Quiet'],
  };

  // TODO: Replace with actual matches data from database
  const mockMatches = [
    {
      id: '1',
      name: 'Alyssa I.',
      school: 'University of Hawaiʻi at Mānoa',
      photoUrl: '',
    },
    {
      id: '2',
      name: 'Colin K.',
      school: 'University of Hawaiʻi at Mānoa',
      photoUrl: '',
    },
    {
      id: '3',
      name: 'Dylan S.',
      school: 'University of Hawaiʻi at Mānoa',
      photoUrl: '',
    },
  ];

  const handleEditProfile = () => {
    // TODO: Navigate to profile edit page or open modal
    window.location.href = '/lifestyle-survey';
  };

  return (
    <main>
      <Container className="py-4 pb-5 mb-5">
        <Row className="g-4">
          {/* Left Column - User Profile */}
          <Col lg={4} md={12}>
            <UserProfileOverview
              name={mockUserData.name}
              school={mockUserData.school}
              program={mockUserData.program}
              year={mockUserData.year}
              photoUrl={mockUserData.photoUrl}
              surveyCompletion={mockUserData.surveyCompletion}
              matchesFound={mockUserData.matchesFound}
              onEditProfile={handleEditProfile}
            />
          </Col>

          {/* Right Column - Compatibility & Matches */}
          <Col lg={8} md={12}>
            <Row className="g-4 h-auto">
              {/* Compatibility Highlights */}
              <Col xs={12}>
                <CompatibilityHighlightsWidget
                  matchName={mockBestMatch.matchName}
                  matchSchool={mockBestMatch.matchSchool}
                  matchMajor={mockBestMatch.matchMajor}
                  matchPhotoUrl={mockBestMatch.matchPhotoUrl}
                  compatibilityScore={mockBestMatch.compatibilityScore}
                  sharedTraits={mockBestMatch.sharedTraits}
                />
              </Col>

              {/* Quick Matches List */}
              <Col xs={12}>
                <QuickMatchesList matches={mockMatches} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default UserHomePage;
