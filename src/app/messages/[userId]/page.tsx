/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert, Dropdown } from 'react-bootstrap';
import {
  PersonCircle,
  Send,
  ArrowLeft,
  PersonFill,
  ShieldX,
  ExclamationTriangle,
} from 'react-bootstrap-icons';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt: string | null;
}

interface UserProfile {
  id: number;
  name: string;
  photo: string | null;
}

interface ConversationData {
  otherUser: UserProfile;
  messages: Message[];
}

const ConversationPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated' && userId) {
      fetchConversation();
      markConversationAsRead();
    }
  }, [status, userId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/messages/conversation/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    try {
      await fetch(`/api/messages/mark-conversation-read/${userId}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to mark conversation as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: parseInt(userId, 10),
          content: messageInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add the new message to the conversation
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, data.message],
        });
      }

      setMessageInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = formatDate(message.sentAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

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

  if (error && !conversation) {
    return (
      <main className="bg-light py-4">
        <Container className="py-4">
          <Alert variant="danger">
            {error}
            <div className="mt-2">
              <Button variant="outline-danger" size="sm" onClick={() => router.push('/messages')}>
                Back to Messages
              </Button>
            </div>
          </Alert>
        </Container>
      </main>
    );
  }

  if (!conversation) {
    return null;
  }

  const messageGroups = groupMessagesByDate(conversation.messages);
  const currentUserId = session?.user?.id ? parseInt(session.user.id as string, 10) : 0;

  return (
    <main className="bg-light py-4">
      <Container className="py-4">
        <Row>
          <Col>
            <Card className="shadow-sm" style={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
              {/* Conversation Header */}
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center">
                  <Button
                    variant="link"
                    className="text-dark p-0 me-3"
                    onClick={() => router.push('/messages')}
                  >
                    <ArrowLeft size={24} />
                  </Button>

                  {conversation.otherUser.photo ? (
                    <img
                      src={conversation.otherUser.photo}
                      alt={conversation.otherUser.name}
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold me-3"
                      style={{ width: '40px', height: '40px' }}
                    >
                      {getInitials(conversation.otherUser.name)}
                    </div>
                  )}

                  <div className="flex-grow-1">
                    <h5 className="mb-0">{conversation.otherUser.name}</h5>
                  </div>

                  {/* Dropdown menu for user actions */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="link"
                      className="text-dark p-0"
                      id="user-actions-dropdown"
                    >
                      <span className="visually-hidden">User actions</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => router.push(`/profile/${conversation.otherUser.id}`)}
                      >
                        <PersonFill className="me-2" />
                        View Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        className="text-warning"
                        onClick={() => {
                          console.log(`Block user: ${conversation.otherUser.name}`);
                          // TODO: Implement block user functionality
                        }}
                      >
                        <ShieldX className="me-2" />
                        Block User
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => {
                          console.log(`Report user: ${conversation.otherUser.name}`);
                          // TODO: Implement report user functionality
                        }}
                      >
                        <ExclamationTriangle className="me-2" />
                        Report User
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Card.Header>

              {/* Messages Area */}
              <Card.Body style={{ overflowY: 'auto', flex: 1 }}>
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                {conversation.messages.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {Object.entries(messageGroups).map(([date, messages]) => (
                      <div key={date}>
                        <div className="text-center my-3">
                          <Badge bg="secondary" className="px-3 py-2">
                            {date}
                          </Badge>
                        </div>
                        {messages.map((message) => {
                          const isCurrentUser = message.senderId === currentUserId;
                          return (
                            <div
                              key={message.id}
                              className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                              <div
                                style={{
                                  maxWidth: '70%',
                                  padding: '10px 15px',
                                  borderRadius: '15px',
                                  backgroundColor: isCurrentUser ? '#0d6efd' : '#e9ecef',
                                  color: isCurrentUser ? 'white' : 'black',
                                }}
                              >
                                <p className="mb-1">{message.content}</p>
                                <small
                                  style={{
                                    fontSize: '0.75rem',
                                    opacity: 0.8,
                                  }}
                                >
                                  {formatTime(message.sentAt)}
                                </small>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Card.Body>

              {/* Message Input */}
              <Card.Footer className="bg-white border-top">
                <Form onSubmit={handleSendMessage}>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={sending || !messageInput.trim()}
                    >
                      {sending ? <Spinner animation="border" size="sm" /> : <Send />}
                    </Button>
                  </div>
                </Form>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ConversationPage;
