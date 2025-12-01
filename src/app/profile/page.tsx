import { getServerSession } from 'next-auth';
import { Container, Row, Col } from 'react-bootstrap';
import { redirect } from 'next/navigation';
import UserOverviewCard from '@/components/UserOverviewCard';
import CompatibilityCard from '@/components/CompatibilityCard';
import MatchesCardOverview from '@/components/MatchesCardOverview';
import { getProfileByEmail } from '@/lib/dbActions';
import authOptions from '@/lib/authOptions';

const ProfilePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/auth/signin');
  }

  const profile = await getProfileByEmail(session.user.email);

  if (!profile) {
    return (
      <Container className="py-5 text-center">
        <h2>Profile not found</h2>
        <p>Please make sure you are logged in.</p>
      </Container>
    );
  }

  return (
    <main className="bg-light py-4">
      <Container className="py-4 pb-5 mb-5">
        <Row className="g-4 mb-4">
          {/* LEFT COLUMN */}
          <Col lg={4} md={12}>
            <UserOverviewCard
              name={profile.name}
              year={profile.classStanding || undefined}
              major={profile.major || undefined}
              graduationYear={profile.graduationYear || undefined}
              email={profile.email}
              photoUrl={profile.photoUrl || undefined}
            />
          </Col>

          {/* RIGHT COLUMN */}
          <Col lg={8} md={12}>
            <CompatibilityCard
              interests={profile.interests}
              lifestyle={{
                cleanliness: profile.cleanliness,
                socialLevel: profile.socialLevel,
                sleepSchedule: profile.sleepSchedule,
                guestFrequency: profile.guestFrequency,
                smoking: profile.smoking,
                drinking: profile.drinking,
                pets: profile.pets,
              }}
            />
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
};

export default ProfilePage;
