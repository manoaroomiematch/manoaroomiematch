'use client';

import UserOverviewCard from '@/components/UserOverviewCard';
import CompatibilityCard from '@/components/CompatibilityCard';
import MatchesCardOverview from '@/components/MatchesCardOverview';
import { Container, Row, Col } from 'react-bootstrap';

const ProfilePage = () => (
  <main className="bg-light py-4">
    <Container className="py-4 pb-5 mb-5">
      <Row className="g-4 mb-4">
        {/* LEFT COLUMN */}
        <Col lg={4} md={12}>
          <UserOverviewCard
            name="John Doe"
            year="Junior"
            age={20}
            major="Computer Science"
            bio="I love coding, hiking, and matcha lattes."
            photoUrl="/johndoe.jpg"
          />
        </Col>

        {/* RIGHT COLUMN */}
        <Col lg={8} md={12}>
          <CompatibilityCard />
        </Col>
      </Row>

      {/* MATCHES SECTION */}
      <Row>
        <Col xs={12}>
          <MatchesCardOverview />
        </Col>
      </Row>
    </Container>
  </main>
);

export default ProfilePage;
