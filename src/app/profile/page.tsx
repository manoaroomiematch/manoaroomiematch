'use client';

import UserOverviewCard from '@/components/UserOverviewCard';
import CompatibilityCard from '@/components/CompatibilityCard';
import MatchesCardOverview from '@/components/MatchesCardOverview';
import { Container } from 'react-bootstrap';

const ProfilePage = () => (
  <>
    <Container className="d-flex align-items-center">
      {/* LEFT COLUMN */}
      <div className="w-100 mb-4 flex-row">
        {/*
        John Doe is just a mock up user data for demonstration purposes.
        Will need to fetch this data from your backend database or user session.
        */}
        <UserOverviewCard
          name="John Doe"
          year="Junior"
          age={20}
          major="Computer Science"
          bio="I love coding, hiking, and matcha lattes."
          photoUrl=""
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-100 mb-4 flex-row">
        <CompatibilityCard />
      </div>
    </Container>
    <Container>
      <div className="w-100 text-center">
        <MatchesCardOverview />
      </div>
    </Container>
  </>
);
export default ProfilePage;
