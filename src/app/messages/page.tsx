/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable max-len */
/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  Search,
  PersonCircle,
  PlusCircle,
} from 'react-bootstrap-icons';

interface Conversation {
  userId: number;
  userName: string;
  userPhoto: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  userRole?: string;
}

const MessagesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchConversations();
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/messages/conversations');

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredConversations = conversations.filter((conv) => conv.userName.toLowerCase().includes(searchQuery.toLowerCase()));

  if (status === 'loading' || loading) {
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
        <h1 className="mb-4">Messages</h1>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Row className="g-3">
          {/* LEFT COLUMN - Conversations List */}
          <Col lg={4} md={5}>
            <Card className="shadow-sm" style={{ height: '70vh' }}>
              <Card.Header className="bg-white border-bottom">
                <Form.Group className="mb-0">
                  <div className="d-flex align-items-center gap-2">
                    <div className="position-relative flex-grow-1">
                      <Search
                        className="position-absolute"
                        style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Search conversations..."
                        className="ps-5"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="link"
                      className="p-0 text-primary flex-shrink-0"
                      onClick={() => router.push('/search')}
                      title="New message"
                    >
                      <PlusCircle size={20} />
                    </Button>
                  </div>
                </Form.Group>
              </Card.Header>
              <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <PersonCircle size={64} className="mb-3" />
                    <p className="mb-0">No conversations yet</p>
                    <small>Start chatting with potential roommates!</small>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {filteredConversations.map((conversation) => (
                      <ListGroup.Item
                        key={conversation.userId}
                        onClick={() => router.push(`/messages/${conversation.userId}`)}
                        className="border-0 px-3 py-3"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-start">
                          <div className="me-3 position-relative">
                            {conversation.userPhoto ? (
                              <img
                                src={conversation.userPhoto}
                                alt={conversation.userName}
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ width: '50px', height: '50px' }}
                              >
                                {getInitials(conversation.userName)}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-baseline mb-1">
                              <h6 className={`mb-0 text-truncate ${conversation.unreadCount > 0 ? 'fw-bold text-dark' : 'fw-semibold'}`}>
                                {conversation.userName}
                              </h6>
                              <small className="text-muted ms-2 flex-shrink-0">
                                {getRelativeTime(conversation.lastMessageTime)}
                              </small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <p className={`mb-0 small text-truncate ${conversation.unreadCount > 0 ? 'text-dark fw-semibold' : 'text-muted'}`}>
                                {conversation.lastMessage}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge bg="primary" pill className="ms-2 flex-shrink-0">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT COLUMN - Select a conversation prompt */}
          <Col lg={8} md={7}>
            <Card className="shadow-sm" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <PersonCircle size={80} className="mb-3" />
                  <h5>Select a conversation</h5>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default MessagesPage;
