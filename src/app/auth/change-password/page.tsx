'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Card, Col, Container, Button, Form, Row } from 'react-bootstrap';
import { changePassword } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LockFill } from 'react-bootstrap-icons';

type ChangePasswordForm = {
  oldpassword: string;
  password: string;
  confirmPassword: string;
};

/** The change password page. */
const ChangePassword = () => {
  const { data: session, status } = useSession();
  const email = session?.user?.email || '';
  const validationSchema = Yup.object().shape({
    oldpassword: Yup.string().required('Password is required'),
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
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(validationSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    try {
      await changePassword({ email, ...data });
      await swal('Password Changed', 'Your password has been changed', 'success', { timer: 2000 });
      reset();
    } catch (error) {
      await swal('Error', 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

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
                  <LockFill size={48} className="text-success d-sm-none" />
                  <LockFill size={64} className="text-success d-none d-sm-inline" />
                </div>
                <h1 className="fw-bold mb-2 fs-2 fs-md-1">Change Password</h1>
                <p className="text-muted mb-0 small fs-6">Update your account password</p>
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
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">Current Password</Form.Label>
                    <div className="position-relative">
                      <LockFill
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        type="password"
                        {...register('oldpassword')}
                        className={`form-control form-control-lg ${errors.oldpassword ? 'is-invalid' : ''}`}
                        placeholder="Enter current password"
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
                      <div className="invalid-feedback">{errors.oldpassword?.message}</div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">New Password</Form.Label>
                    <div className="position-relative">
                      <LockFill
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        type="password"
                        {...register('password')}
                        className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter new password"
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
                      <div className="invalid-feedback">{errors.password?.message}</div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">Confirm New Password</Form.Label>
                    <div className="position-relative">
                      <LockFill
                        className="position-absolute text-muted"
                        style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                      />
                      <input
                        type="password"
                        {...register('confirmPassword')}
                        className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Confirm new password"
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
                      <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                    </div>
                  </Form.Group>

                  <div className="d-grid gap-2">
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
                          Updating...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => reset()}
                      disabled={isLoading}
                      style={{
                        borderRadius: '10px',
                        padding: '12px',
                        transition: 'all 0.3s ease',
                        fontWeight: 600,
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ChangePassword;
