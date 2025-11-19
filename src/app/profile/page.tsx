'use client';

import UserOverviewCard from '@/components/UserOverviewCard';
import CompatibilityCard from '@/components/CompatibilityCard';
import MatchesCardOverview from '@/components/MatchesCardOverview';
import { Container, Row, Col } from 'react-bootstrap';

const ProfilePage = () => (
  <>
    <Container className="my-5">
      <Row className="align-items-stretch g-3">
        {/* LEFT COLUMN */}
        <Col md={6}>
          <UserOverviewCard
            name="John Doe"
            year="Junior"
            age={20}
            major="Computer Science"
            bio="I love coding, hiking, and matcha lattes."
            photoUrl=""
          />
        </Col>

        {/* RIGHT COLUMN */}
        <Col md={6} className="d-flex">
          <CompatibilityCard />
        </Col>
      </Row>
    </Container>

    <Container>
      <div className="w-100 text-center">
        <MatchesCardOverview />
      </div>
    </Container>
  </>
);

export default ProfilePage;
