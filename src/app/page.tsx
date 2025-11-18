'use client';

import Link from 'next/link';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

/** The Home page. */
const Home = () => {
  const { data: session } = useSession();

  // Determine the CTA link based on authentication status
  const ctaLink = session ? '/list' : '/auth/signin';

  return (
    <main>
      <Container id="landing-page" fluid className={`${styles.heroSection} py-5`}>
        <Row className="align-items-center justify-content-center min-vh-100">
          <Col lg={8} md={10} xs={12} className="text-center">
            {/* Logo/Branding */}
            <div className={styles.brandingSection}>
              <h2 className={styles.subtitle}>MĀNOA</h2>
              <h3 className={styles.brandSubtitle}>ROOMIEMATCH</h3>
            </div>

            {/* Hero Heading */}
            <h1 className={styles.heroTitle}>
              Find the
              <br />
              Perfect Roommate
            </h1>

            {/* Hero Description */}
            <p className={styles.heroDescription}>
              Connecting students in Mānoa with compatible roommates for a better living experience.
            </p>

            {/* CTA Button */}
            <Link href={ctaLink} className="text-decoration-none">
              <Button
                className={styles.ctaButton}
                aria-label="Start Matching button - Begin finding your perfect roommate"
                role="button"
                tabIndex={0}
              >
                Start Matching
              </Button>
            </Link>

            {/* Secondary CTA for logged-in users */}
            {session && (
              <div className={styles.secondaryCta}>
                <p className={styles.smallText}>
                  or
                  {' '}
                  <Link href="/add" className={styles.link}>
                    view profiles
                  </Link>
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Home;
