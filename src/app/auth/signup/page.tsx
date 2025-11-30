'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Col, Container, Button, Form, Row, Alert } from 'react-bootstrap';
import { createUser } from '@/lib/dbActions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email is invalid'),
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
  } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    setError(null);
    try {
      await createUser(data);
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.ok) {
        router.push('/lifestyle-survey');
      } else {
        setError(result?.error || 'An unknown error occurred during sign in.');
      }
    } catch (e: any) {
      if (e.message.includes('Unique constraint failed')) {
        setError('A user with this email already exists.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center">Sign Up</h1>
            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col>
                      <Form.Group className="form-group">
                        <Form.Label>First Name</Form.Label>
                        <input
                          type="text"
                          {...register('firstName')}
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">{errors.firstName?.message}</div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="form-group">
                        <Form.Label>Last Name</Form.Label>
                        <input
                          type="text"
                          {...register('lastName')}
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">{errors.lastName?.message}</div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="form-group">
                    <Form.Label>Email</Form.Label>
                    <input
                      type="text"
                      {...register('email')}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label>Password</Form.Label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label>Confirm Password</Form.Label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group py-3">
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary">
                          Register
                        </Button>
                      </Col>
                      <Col>
                        <Button type="button" onClick={() => reset()} className="btn btn-warning float-right">
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Card.Body>
              <Card.Footer>
                Already have an account?
                <a href="/auth/signin">Sign in</a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SignUp;
