'use client';

import { signIn } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useState } from 'react';
import { EnvelopeFill, LockFill, PersonCircle } from 'react-bootstrap-icons';

/** The sign in page. */
const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      callbackUrl: '/profile',
      email,
      password,
    });

    if (result?.error) {
      console.error('Sign in failed: ', result.error);
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        flex: '1 0 auto',
        background: 'linear-gradient(135deg, #f0f9f4 0%, #d4edda 100%)',
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <Container className="py-4 pb-5 mb-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <div className="text-center mb-4">
              <div className="mb-3">
                <PersonCircle size={64} className="text-success" />
              </div>
              <h1 className="display-4 fw-bold mb-2">Welcome Back</h1>
              <p className="text-muted">Sign in to continue to Manoa Roomie Match</p>
            </div>
            <Card
              className="shadow-lg border-0"
              style={{
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <Card.Body className="p-5">
                <Form method="post" onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-4">
                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                    <div className="position-relative">
                      <EnvelopeFill
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        name="email"
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          paddingLeft: '45px',
                          transition: 'all 0.3s ease',
                          border: '2px solid #e0e0e0',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#198754'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Password</Form.Label>
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
                        onFocus={(e) => e.target.style.borderColor = '#198754'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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
