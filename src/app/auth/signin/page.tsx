'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { EnvelopeFill, LockFill, PersonCircle } from 'react-bootstrap-icons';

/** The sign in page. */
const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect to appropriate page after successful login
  useEffect(() => {
    if (session?.user) {
      if (session.user.randomKey === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/profile');
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error('Sign in failed: ', result.error);
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/background/Flower%20Print%202.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        imageRendering: 'crisp-edges',
        filter: 'contrast(1.05) saturate(1.1)',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto',
      }}
    >
      <Container className="py-3 py-md-4 py-lg-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <Row className="justify-content-center g-0 w-100">
          <Col xs={12} sm={11} md={9} lg={7} xl={6}>
            <Card
              className="shadow-lg border-0 text-center mb-4"
              style={{
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <Card.Body className="p-3 p-md-4">
                <div className="mb-2 mb-md-3">
                  <PersonCircle size={48} className="text-success d-sm-none" />
                  <PersonCircle size={64} className="text-success d-none d-sm-inline" />
                </div>
                <h1 className="fw-bold mb-2 fs-2 fs-md-1">Welcome Back</h1>
                <p className="text-muted mb-0 small fs-6">Sign in to continue to Manoa Roomie Match</p>
              </Card.Body>
            </Card>
            <Card
              className="shadow-lg border-0"
              style={{
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <Card.Body className="p-3 p-md-4 p-lg-5">
                <Form method="post" onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-4">
                    <Form.Label className="fw-semibold small">Email Address</Form.Label>
                    <div className="position-relative">
                      <EnvelopeFill
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        name="email"
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="you@hawaii.edu"
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          paddingLeft: '45px',
                          transition: 'all 0.3s ease',
                          border: '2px solid #e0e0e0',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#198754'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Password</Form.Label>
                    <div className="position-relative">
                      <LockFill
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        name="password"
                        type="password"
                        className="form-control form-control-lg"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          paddingLeft: '45px',
                          transition: 'all 0.3s ease',
                          border: '2px solid #e0e0e0',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#198754'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                      />
                    </div>
                  </Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="text-muted"
                    />
                    <a href="/auth/change-password" className="text-success text-decoration-none small">
                      Forgot password?
                    </a>
                  </div>
                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      disabled={isLoading}
                      style={{
                        borderRadius: '10px',
                        padding: '12px',
                        transition: 'all 0.3s ease',
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(25, 135, 84, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer
                className="text-center py-4 bg-light border-0"
                style={{ borderRadius: '0 0 16px 16px' }}
              >
                <span className="text-muted">Don&apos;t have an account?</span>
                {' '}
                <a href="/auth/signup" className="fw-bold text-success text-decoration-none">
                  Sign up
                </a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SignIn;
