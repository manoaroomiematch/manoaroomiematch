'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Col, Container, Button, Form, Row, Alert, ProgressBar } from 'react-bootstrap';
import { createUser } from '@/lib/dbActions';
import { useState, useEffect } from 'react';
import { PersonFill, EnvelopeFill, LockFill } from 'react-bootstrap-icons';

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  // acceptTerms: boolean;
};
/** The sign up page. */
const SignUp = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Email is invalid')
      .test('is-hawaii-edu', 'Only @hawaii.edu emails are allowed', (value) => {
        if (!value) return false;
        return value.toLowerCase().endsWith('@hawaii.edu');
      }),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), ''], 'Confirm Password does not match'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [watchPassword, setWatchPassword] = useState('');

  const calculatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;
    let label = '';
    let color = '';
    if (score < 30) {
      label = 'Weak';
      color = 'danger';
    } else if (score < 60) {
      label = 'Fair';
      color = 'warning';
    } else if (score < 80) {
      label = 'Good';
      color = 'info';
    } else {
      label = 'Strong';
      color = 'success';
    }
    return { score, label, color };
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(watchPassword));
  }, [watchPassword]);

  const onSubmit = async (data: SignUpForm) => {
    setSubmitError(null);
    setIsLoading(true);

    try {
      // console.log(JSON.stringify(data, null, 2));
      await createUser(data);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message === 'Email already exists' || (error.message && error.message.includes('Unique constraint'))) {
        setSubmitError('This email is already registered.');
      } else {
        setSubmitError(`Registration failed: ${error.message || 'Unknown error'}`);
      }
      setIsLoading(false);
      return;
    }

    try {
      // Ensure new signups start survey from the beginning
      try {
        localStorage.setItem('survey-start-fresh', 'true');
        // Also clear any possible previous completion markers
        localStorage.removeItem('lifestyle-survey-completed');
        localStorage.removeItem('lifestyle-survey-draft');
      } catch (e) {
        // Ignore localStorage errors (e.g., server-side)
      }

      // After creating, signIn with redirect to the lifestyle survey page
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true, // Explicitly set redirect to true
        callbackUrl: '/lifestyle-survey', // Use a relative path for NextAuth to handle
      });

      // Since redirect is true, NextAuth handles the navigation.
      // If there's an error, it will be caught.
      if (result?.error) {
        setSubmitError(`Sign in failed after registration: ${result.error}. Please try logging in manually.`);
        setIsLoading(false);
      }
      // No need for router.push here, NextAuth will redirect.
    } catch (error: any) {
      console.error('Sign in error:', error);
      setSubmitError(`An unexpected error occurred during sign-in: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/background/Flower%20%20Print.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        flex: '1 0 auto',
      }}
    >
      <Container className="py-3 py-md-4 py-lg-5">
        <Row className="justify-content-center g-0 px-2">
          <Col xs={12} sm={11} md={9} lg={6} xl={5}>
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
                  <PersonFill size={36} className="text-success d-sm-none" />
                  <PersonFill size={48} className="text-success d-none d-sm-inline" />
                </div>
                <h1 className="fw-bold mb-2 fs-3 fs-md-2 fs-lg-1">Create Account</h1>
                <p className="text-muted mb-0 small fs-6">Join Mānoa Roomie Match and find your ideal roommate</p>
              </Card.Body>
            </Card>
            <Alert variant="info" className="shadow-sm mb-3 py-2 px-2 px-md-3 small fs-7">
              <Alert.Heading className="h6 fw-bold mb-2">
                <EnvelopeFill className="me-2" />
                UH Email Required
              </Alert.Heading>
              <p className="mb-2">
                Only
                {' '}
                <strong>@hawaii.edu</strong>
                {' '}
                email addresses can create an account.
              </p>
              <p className="mb-0">
                Don&apos;t have your UH email?
                {' '}
                <a
                  href="https://www.hawaii.edu/myuhinfo/uh-email-account/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none fw-semibold"
                  style={{ color: '#198754' }}
                >
                  Learn how to get it here
                </a>
              </p>
            </Alert>
            {submitError && (
              <Alert variant="danger" onClose={() => setSubmitError(null)} dismissible className="shadow-sm">
                {submitError}
              </Alert>
            )}
            <Card
              className="shadow-lg border-0"
              style={{
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <Card.Body className="p-3 p-md-4 p-lg-5">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row className="g-2">
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">First Name</Form.Label>
                        <input
                          type="text"
                          {...register('firstName')}
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                          placeholder="John"
                          disabled={isLoading}
                          style={{
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            height: '44px',
                            transition: 'all 0.3s ease',
                            border: '2px solid #e0e0e0',
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#198754'}
                          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        <div className="invalid-feedback">{errors.firstName?.message}</div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">Last Name</Form.Label>
                        <input
                          type="text"
                          {...register('lastName')}
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                          placeholder="Doe"
                          disabled={isLoading}
                          style={{
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            height: '44px',
                            transition: 'all 0.3s ease',
                            border: '2px solid #e0e0e0',
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#198754'}
                          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        <div className="invalid-feedback">{errors.lastName?.message}</div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Email Address</Form.Label>
                    <div className="position-relative">
                      <EnvelopeFill
                        size={18}
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        type="email"
                        {...register('email')}
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="you@hawaii.edu"
                        disabled={isLoading}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          paddingLeft: '45px',
                          height: '44px',
                          transition: 'all 0.3s ease',
                          border: '2px solid #e0e0e0',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#198754'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <div className="invalid-feedback">{errors.email?.message}</div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Password</Form.Label>
                    <div className="position-relative">
                      <LockFill
                        size={18}
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        type="password"
                        {...register('password', {
                          onChange: (e) => setWatchPassword(e.target.value),
                        })}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Minimum 6 characters"
                        disabled={isLoading}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          paddingLeft: '45px',
                          height: '44px',
                          transition: 'all 0.3s ease',
                          border: '2px solid #e0e0e0',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#198754'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <div className="invalid-feedback">{errors.password?.message}</div>
                    </div>
                    {watchPassword && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Password Strength:</small>
                          <small
                            className={`text-${passwordStrength.color} fw-semibold`}
                          >
                            {passwordStrength.label}
                          </small>
                        </div>
                        <ProgressBar
                          now={passwordStrength.score}
                          variant={passwordStrength.color}
                          style={{ height: '6px', borderRadius: '3px' }}
                        />
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">Confirm Password</Form.Label>
                    <div className="position-relative">
                      <LockFill
                        size={18}
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        type="password"
                        {...register('confirmPassword')}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Re-enter your password"
                        disabled={isLoading}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          paddingLeft: '45px',
                          height: '44px',
                          transition: 'all 0.3s ease',
                          border: '2px solid #e0e0e0',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#198754'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                    </div>
                  </Form.Group>
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
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer
                className="text-center py-4 bg-light border-0"
                style={{ borderRadius: '0 0 16px 16px' }}
              >
                <span className="text-muted">Already have an account?</span>
                {' '}
                <a href="/auth/signin" className="fw-bold text-success text-decoration-none">
                  Sign in
                </a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SignUp;
