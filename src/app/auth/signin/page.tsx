'use client';

import { signIn } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row, Modal } from 'react-bootstrap';
import { useState } from 'react';
import { EnvelopeFill, LockFill, PersonCircle, ExclamationTriangleFill } from 'react-bootstrap-icons';

interface FlagInfo {
  reason: string;
  status: string;
  createdAt: string;
}

interface ActionInfo {
  action: string;
  createdAt: string;
}

/** The sign in page. */
const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionInfo, setSuspensionInfo] = useState<{
    type: 'suspended' | 'deactivated';
    suspendedUntil?: string;
    flagInfo?: FlagInfo;
    actionInfo?: ActionInfo;
  } | null>(null);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (suspendedUntil: string) => {
    const now = new Date();
    const end = new Date(suspendedUntil);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'expired';
    }

    const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    if (hours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }

    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;

    try {
      // Check if user is suspended or deactivated FIRST
      // This avoids unnecessary redirect logic and provides better UX
      // Reuse role from this call to avoid a second API call
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();

        if (checkData.status === 'suspended') {
          setSuspensionInfo({
            type: 'suspended',
            suspendedUntil: checkData.suspendedUntil,
            flagInfo: checkData.flag,
            actionInfo: checkData.action,
          });
          setShowSuspensionModal(true);
          setIsLoading(false);
          return;
        }

        if (checkData.status === 'deactivated') {
          setSuspensionInfo({
            type: 'deactivated',
            flagInfo: checkData.flag,
            actionInfo: checkData.action,
          });
          setShowSuspensionModal(true);
          setIsLoading(false);
          return;
        }

        // Credentials are valid and user is not suspended - proceed with sign-in
        // Reuse role from checkData instead of making a second API call
        const callbackUrl = checkData.role === 'ADMIN' ? '/admin' : '/home';

        await signIn('credentials', {
          callbackUrl,
          email,
          password,
        });
      }
    } catch (err) {
      console.error('Sign in error:', err);
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
      {/* Suspension/Deactivation Modal */}
      <Modal show={showSuspensionModal} onHide={() => setShowSuspensionModal(false)} centered backdrop="static">
        <Modal.Header className="bg-danger text-white border-0">
          <div className="d-flex align-items-center gap-2">
            <ExclamationTriangleFill size={24} />
            <Modal.Title>
              {suspensionInfo?.type === 'suspended' ? 'Account Suspended' : 'Account Deactivated'}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="mb-3">
            <p className="text-muted mb-2">
              {suspensionInfo?.type === 'suspended'
                ? 'Your account has been temporarily suspended.'
                : 'Your account has been deactivated.'}
            </p>
          </div>

          {suspensionInfo?.flagInfo?.reason && (
            <div className="alert alert-info mb-3">
              <strong>Reason:</strong>
              {' '}
              {suspensionInfo.flagInfo.reason}
            </div>
          )}

          {suspensionInfo?.type === 'suspended' && suspensionInfo?.suspendedUntil && (
            <div className="mb-3">
              <p className="mb-1">
                <strong>Suspension Period:</strong>
              </p>
              <p className="text-muted mb-1">
                Suspended until:
                {' '}
                <span className="fw-semibold">{formatDate(suspensionInfo.suspendedUntil)}</span>
              </p>
              {suspensionInfo.flagInfo?.createdAt && (
                <p className="text-muted mb-0">
                  Duration:
                  {' '}
                  <span className="fw-semibold">
                    {calculateDuration(suspensionInfo.suspendedUntil)}
                  </span>
                </p>
              )}
            </div>
          )}

          {suspensionInfo?.type === 'deactivated' && (
            <div className="mb-3">
              <p className="text-muted mb-0">
                Please contact support to regain access to your account.
              </p>
            </div>
          )}

          {(suspensionInfo?.flagInfo?.createdAt || suspensionInfo?.actionInfo?.createdAt) && (
            <div className="mt-3 pt-3 border-top">
              {suspensionInfo?.flagInfo?.createdAt && (
                <p className="text-muted mb-2">
                  <small>
                    <strong>Reported on:</strong>
                    {' '}
                    {formatDate(suspensionInfo.flagInfo.createdAt)}
                  </small>
                </p>
              )}
              {suspensionInfo?.actionInfo?.createdAt && (
                <p className="text-muted mb-0">
                  <small>
                    <strong>
                      {suspensionInfo.type === 'suspended' ? 'Suspended on:' : 'Deactivated on:'}
                    </strong>
                    {' '}
                    {formatDate(suspensionInfo.actionInfo.createdAt)}
                  </small>
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="secondary" onClick={() => setShowSuspensionModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
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
