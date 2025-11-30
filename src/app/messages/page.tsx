/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { Search, Envelope, PersonCircle, Send } from 'react-bootstrap-icons';

/**
 * Messages Page Component (Mockup)
 *
 * Non-functional messaging interface mockup for the application.
 * Features:
 * - Conversation list with user avatars and latest messages
 * - Message thread view with timestamp
 * - Message input area
 * - Search functionality placeholder
 *
 * TODO: Implement Prisma schema for messages
 * TODO: Create API routes for:
 *   - Fetching conversations
 *   - Sending messages
 *   - Marking messages as read
 * TODO: Add real-time messaging with WebSockets or polling
 * TODO: Add message notifications
 * TODO: Add message pagination/infinite scroll
 * TODO: Add file/image sharing capability
 */

interface MockConversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  photoUrl?: string;
}

interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

/**
 * MOCK DATA - Placeholder for development
 * TODO: Replace with actual API calls to fetch conversations and messages
 */
const mockConversations: MockConversation[] = [
  {
    id: '1',
    name: 'Kai Nakamura',
    lastMessage: "Sounds good! Let me know when you're free.",
    timestamp: '10:30 AM',
    unread: true,
  },
  {
    id: '2',
    name: 'Leilani Santos',
    lastMessage: 'Thanks for reaching out!',
    timestamp: 'Yesterday',
    unread: false,
  },
  {
    id: '3',
    name: 'Noa Tanaka',
    lastMessage: "I'm interested in being roommates!",
    timestamp: 'Monday',
    unread: false,
  },
  {
    id: '4',
    name: 'Makani Lee',
    lastMessage: 'Do you have any pets?',
    timestamp: 'Last week',
    unread: false,
  },
];

const mockMessages: { [key: string]: MockMessage[] } = {
  1: [
    {
      id: '1',
      senderId: '1',
      senderName: 'Kai Nakamura',
      content: 'Hi! I saw we share many interests. Would you like to chat about possibly being roommates?',
      timestamp: '9:45 AM',
      isCurrentUser: false,
    },
    {
      id: '2',
      senderId: 'current',
      senderName: 'You',
      content: "Hi Kai! Yes, I'd love to chat. When are you free to meet up?",
      timestamp: '10:15 AM',
      isCurrentUser: true,
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Kai Nakamura',
      content: "Sounds good! Let me know when you're free.",
      timestamp: '10:30 AM',
      isCurrentUser: false,
    },
  ],
  2: [
    {
      id: '1',
      senderId: 'current',
      senderName: 'You',
      content: 'Hi Leilani! I noticed we share similar lifestyle preferences.',
      timestamp: 'Yesterday 2:30 PM',
      isCurrentUser: true,
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'Leilani Santos',
      content: 'Thanks for reaching out!',
      timestamp: 'Yesterday 3:00 PM',
      isCurrentUser: false,
    },
  ],
};

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentMessages = mockMessages[selectedConversation] || [];
  const selectedConvInfo = mockConversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual message sending via API
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <main className="bg-light py-4">
      <Container className="py-4">
        <h1 className="mb-4">
          <Envelope className="me-2" />
          Messages
        </h1>

        <Row className="g-3">
          {/* LEFT COLUMN - Conversations List */}
          <Col lg={4} md={5}>
            <Card className="shadow-sm" style={{ height: '70vh' }}>
              <Card.Header className="bg-white border-bottom">
                <Form.Group className="mb-0">
                  <div className="position-relative">
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
                </Form.Group>
              </Card.Header>
              <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
                <ListGroup variant="flush">
                  {mockConversations.map((conversation) => (
                    <ListGroup.Item
                      key={conversation.id}
                      action
                      active={selectedConversation === conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className="border-0 px-3 py-3"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          <PersonCircle size={50} color="#6c757d" />
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex justify-content-between align-items-baseline mb-1">
                            <h6 className="mb-0 fw-semibold text-truncate">{conversation.name}</h6>
                            <small className="text-muted ms-2 flex-shrink-0">{conversation.timestamp}</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <p className="mb-0 text-muted small text-truncate">{conversation.lastMessage}</p>
                            {conversation.unread && (
                              <Badge bg="primary" pill className="ms-2 flex-shrink-0">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT COLUMN - Message Thread */}
          <Col lg={8} md={7}>
            <Card className="shadow-sm" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              {/* Conversation Header */}
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center">
                  <PersonCircle size={40} color="#6c757d" className="me-3" />
                  <div>
                    <h5 className="mb-0">{selectedConvInfo?.name}</h5>
                    <small className="text-muted">Online</small>
                  </div>
                </div>
              </Card.Header>

              {/* Messages Area */}
              <Card.Body style={{ overflowY: 'auto', flex: 1 }}>
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex mb-3 ${message.isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '10px 15px',
                        borderRadius: '15px',
                        backgroundColor: message.isCurrentUser ? '#0d6efd' : '#e9ecef',
                        color: message.isCurrentUser ? 'white' : 'black',
                      }}
                    >
                      <p className="mb-1">{message.content}</p>
                      <small
                        style={{
                          fontSize: '0.75rem',
                          opacity: 0.8,
                        }}
                      >
                        {message.timestamp}
                      </small>
                    </div>
                  </div>
                ))}
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
                      disabled
                    />
                    <Button type="submit" variant="primary" disabled>
                      <Send />
                    </Button>
                  </div>
                  <small className="text-muted d-block mt-2">
                    * Messaging functionality coming soon - currently non-functional mockup
                  </small>
                </Form>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default MessagesPage;
