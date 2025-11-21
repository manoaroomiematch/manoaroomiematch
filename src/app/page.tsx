'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

/** The Landing page - redirects to home if user is logged in */
const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to the home page
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/home');
    }
  }, [status, session, router]);

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

  // Show landing page only for non-authenticated users
  if (status === 'unauthenticated') {
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
              <Link href="/auth/signin" className="text-decoration-none">
                <Button
                  className={styles.ctaButton}
                  aria-label="Start Matching button - Begin finding your perfect roommate"
                  role="button"
                  tabIndex={0}
                >
                  Start Matching
                </Button>
              </Link>

              {/* Sign Up Link */}
              <div className={styles.secondaryCta}>
                <p className={styles.smallText}>
                  Don&apos;t have an account?
                  {' '}
                  <Link href="/auth/signup" className={styles.link}>
                    Sign up
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    );
  }

  return null;
};

export default Home;
