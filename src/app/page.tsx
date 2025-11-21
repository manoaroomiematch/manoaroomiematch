'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { People, BarChartLine, ShieldCheck, Lightbulb } from 'react-bootstrap-icons';
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
      <main className={styles.landingPage}>
        <div className={styles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  const features = [
    {
      icon: People,
      title: 'Smart Matching',
      description: 'Find compatible roommates using our transparent compatibility algorithm.',
    },
    {
      icon: BarChartLine,
      title: 'Profile Creation',
      description: 'Quick lifestyle survey to share your preferences and living habits.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Profiles',
      description: 'UH authentication ensures real students in your community.',
    },
    {
      icon: Lightbulb,
      title: 'AI Assistance',
      description: 'Optional AI-powered message templates to start conversations.',
    },
  ];

  // Show landing page only for non-authenticated users
  if (status === 'unauthenticated') {
    return (
      <main className={styles.landingPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground} />
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              {/* Hero heading only - branding removed to avoid duplication */}
              <h1 className={styles.heroHeading}>Find the Perfect Roommate</h1>

              <p className={styles.heroTagline}>
                Connecting students in Mānoa with compatible roommates for a better living experience.
              </p>

              {/* Small info cards moved into hero */}
              <div className={styles.heroInfoContainer}>
                <div className={styles.heroInfoCard}>
                  <h4>Profile Creation</h4>
                  <p>
                    Quick lifestyle survey
                    <br />
                    <span className={styles.noWrap}>(6-10 questions)</span>
                  </p>
                </div>
                <div className={styles.heroInfoCard}>
                  <h4>Browse Matches</h4>
                  <p>Filter by preferences, dorm, and budget</p>
                </div>
                <div className={styles.heroInfoCard}>
                  <h4>Connect</h4>
                  <p>Use our messaging tools to start conversations</p>
                </div>
              </div>

              <div className={styles.heroCtaWrap}>
                <Link href="/auth/signin" className="text-decoration-none">
                  <button
                    type="button"
                    className={styles.ctaButton}
                    aria-label="Start Matching button"
                  >
                    Start Matching
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className={styles.overviewSection}>
          <div className={styles.overviewContainer}>
            <h2 className={styles.sectionTitle}>What is Mānoa RoomieMatch?</h2>
            <p className={styles.overviewText}>
              Every semester, hundreds of UH Mānoa students struggle to find compatible roommates.
              Mānoa RoomieMatch makes it easy with a fast, transparent, and UH-specific matching platform.
              We combine lifestyle data with optional AI assistance to help you find your perfect roommate
              and avoid conflicts before they start.
            </p>
          </div>
        </section>

        {/* Key Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresContainer}>
            <h2 className={styles.sectionTitle}>Key Features</h2>
            <div className={styles.featuresGrid}>
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                      <Icon />
                    </div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Second CTA placed above Sign Up Prompt */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>Ready to Find Your Perfect Match?</h2>
            <p className={styles.ctaSubtitle}>
              Start your journey to finding the ideal roommate today.
            </p>
            <Link href="/auth/signin" className="text-decoration-none">
              <button
                type="button"
                className={styles.ctaButtonLarge}
                aria-label="Start Matching"
              >
                Start Matching Now
              </button>
            </Link>
          </div>
        </section>

        {/* Sign Up Prompt */}
        <section className={styles.signupPromptSection}>
          <div className={styles.signupPromptContainer}>
            <p className={styles.signupPromptText}>
              Don&apos;t have an account?
              {' '}
              <Link href="/auth/signup" className={styles.signupLink}>
                Sign up now
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return null;
};

export default Home;
