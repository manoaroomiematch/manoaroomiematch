/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable max-len */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { PersonCircle, Search, ChatDots } from 'react-bootstrap-icons';

interface UserResult {
  id: number;
  name: string;
  email: string;
  major?: string;
  photoUrl?: string;
  bio?: string;
}

const NewMessagePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
          throw new Error('Failed to search users');
        }

        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleStartConversation = (userId: number) => {
    router.push(`/messages/${userId}`);
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (status === 'loading') {
    return (
      <main className="bg-light py-4">
        <Container className="py-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-light py-4">
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <h1 className="mb-4">New Message</h1>

            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Form>
                  <Form.Group>
                    <div className="position-relative">
                      <Search
                        className="position-absolute"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}
                        size={20}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Search for users by name or email..."
                        className="ps-5"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading && (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Searching...</span>
                </Spinner>
              </div>
            )}

            {!loading && searchQuery && searchResults.length === 0 && (
              <Card className="shadow-sm">
                <Card.Body className="text-center py-5 text-muted">
                  <PersonCircle size={64} className="mb-3" />
                  <p>
                    No users found matching &quot;
                    {searchQuery}
                    &quot;
                  </p>
                </Card.Body>
              </Card>
            )}

            {!loading && searchResults.length > 0 && (
              <Card className="shadow-sm">
                <ListGroup variant="flush">
                  {searchResults.map((user) => (
                    <ListGroup.Item
                      key={user.id}
                      className="px-3 py-3"
                      action
                      onClick={() => handleStartConversation(user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={user.name}
                              className="rounded-circle"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ width: '50px', height: '50px' }}
                            >
                              {getInitials(user.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <h6 className="mb-0 fw-semibold">{user.name}</h6>
                          {user.major && (
                            <p className="mb-0 small text-muted">{user.major}</p>
                          )}
                          {user.bio && (
                            <p className="mb-0 small text-muted text-truncate">{user.bio}</p>
                          )}
                        </div>
                        <div className="ms-3">
                          <Button variant="success" size="sm">
                            <ChatDots className="me-1" size={16} />
                            Message
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            )}

            {!searchQuery && (
              <Card className="shadow-sm">
                <Card.Body className="text-center py-5 text-muted">
                  <Search size={64} className="mb-3" />
                  <p>Start typing to search for users</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default NewMessagePage;
