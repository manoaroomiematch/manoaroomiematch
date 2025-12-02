'use client';

import { signOut } from 'next-auth/react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';

/** After the user clicks the "SignOut" link in the NavBar, log them out and display this page. */
const SignOut = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    setIsLoading(true);
    signOut({ callbackUrl: '/', redirect: true });
  };

  return (
    <main>
      <Container className="py-4 pb-5 mb-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-5 text-center">
                <div className="mb-4">
                  <div
                    className="mx-auto mb-4"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#198754',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="40" height="40" fill="white" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      <path d="M12 12c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4z" />
                      <path d="M11 7.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z" />
                    </svg>
                  </div>
                  <h2 className="fw-bold mb-3">Sign Out</h2>
                  <p className="text-muted mb-0">
                    Are you sure you want to sign out of your account?
                  </p>
                </div>
                <div className="d-grid gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    style={{ borderRadius: '10px', padding: '12px' }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Signing out...
                      </>
                    ) : (
                      'Yes, Sign Out'
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    href="/"
                    disabled={isLoading}
                    style={{ borderRadius: '10px', padding: '12px' }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SignOut;
