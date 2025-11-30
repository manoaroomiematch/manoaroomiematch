/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Dropdown } from 'react-bootstrap';
// eslint-disable-next-line max-len
import {
  Search,
  PersonCircle,
  Send,
  ThreeDotsVertical,
  PersonFill,
  ShieldX,
  ExclamationTriangle,
} from 'react-bootstrap-icons';

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
  date: string;
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
    timestamp: '11/21/25',
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
      date: 'Today',
      isCurrentUser: false,
    },
    {
      id: '2',
      senderId: 'current',
      senderName: 'You',
      content: "Hi Kai! Yes, I'd love to chat. When are you free to meet up?",
      timestamp: '10:15 AM',
      date: 'Today',
      isCurrentUser: true,
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Kai Nakamura',
      content: "Sounds good! Let me know when you're free.",
      timestamp: '10:30 AM',
      date: 'Today',
      isCurrentUser: false,
    },
  ],
  2: [
    {
      id: '1',
      senderId: 'current',
      senderName: 'You',
      content: 'Hi Leilani! I noticed we share similar lifestyle preferences.',
      timestamp: '2:30 PM',
      date: 'Yesterday',
      isCurrentUser: true,
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'Leilani Santos',
      content: 'Thanks for reaching out!',
      timestamp: '3:00 PM',
      date: 'Yesterday',
      isCurrentUser: false,
    },
  ],
  3: [
    {
      id: '1',
      senderId: '3',
      senderName: 'Noa Tanaka',
      content: "Hi! I saw your profile and we have a lot in common. I'm interested in being roommates!",
      timestamp: '11:20 AM',
      date: 'Monday',
      isCurrentUser: false,
    },
    {
      id: '2',
      senderId: 'current',
      senderName: 'You',
      content: 'Hey Noa! That sounds great. What are you studying?',
      timestamp: '1:45 PM',
      date: 'Monday',
      isCurrentUser: true,
    },
    {
      id: '3',
      senderId: '3',
      senderName: 'Noa Tanaka',
      content: "I'm majoring in Business. How about you?",
      timestamp: '2:10 PM',
      date: 'Monday',
      isCurrentUser: false,
    },
    {
      id: '4',
      senderId: 'current',
      senderName: 'You',
      content: "Computer Science! I'd love to meet up and chat more about living arrangements.",
      timestamp: '2:30 PM',
      date: 'Monday',
      isCurrentUser: true,
    },
  ],
  4: [
    {
      id: '1',
      senderId: 'current',
      senderName: 'You',
      content: 'Hi Makani! I saw we matched. Wanted to ask about your living preferences.',
      timestamp: '4:15 PM',
      date: 'Wed, Nov 20',
      isCurrentUser: true,
    },
    {
      id: '2',
      senderId: '4',
      senderName: 'Makani Lee',
      content: 'Hi! Sure, what would you like to know?',
      timestamp: '5:30 PM',
      date: 'Wed, Nov 20',
      isCurrentUser: false,
    },
    {
      id: '3',
      senderId: 'current',
      senderName: 'You',
      content: 'Do you have any pets?',
      timestamp: '5:45 PM',
      date: 'Wed, Nov 20',
      isCurrentUser: true,
    },
    {
      id: '4',
      senderId: '4',
      senderName: 'Makani Lee',
      content: 'No pets, but I love animals! Are you thinking of getting one?',
      timestamp: '6:00 PM',
      date: 'Wed, Nov 20',
      isCurrentUser: false,
    },
    {
      id: '5',
      senderId: 'current',
      senderName: 'You',
      content: "Not right away, but maybe in the future. What's your ideal study/sleep schedule?",
      timestamp: '10:20 AM',
      date: 'Thu, Nov 21',
      isCurrentUser: true,
    },
    {
      id: '6',
      senderId: '4',
      senderName: 'Makani Lee',
      content: "I'm definitely a morning person! Usually study from 8 AM to 3 PM, and I'm in bed by 10 PM.",
      timestamp: '11:05 AM',
      date: 'Thu, Nov 21',
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

  // Determine online status based on conversation
  // TODO: Replace with actual online status from API
  const getOnlineStatus = (conversationId: string) =>
    // Kai (1) and Leilani (2) are online, Noa (3) and Makani (4) are offline
    // eslint-disable-next-line implicit-arrow-linebreak
    (['1', '2'].includes(conversationId) ? 'Online' : 'Offline');
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual message sending via API
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <main className="bg-light py-4">
      <Container className="py-4">
        <h1 className="mb-4">Messages</h1>

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
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <PersonCircle size={40} color="#6c757d" className="me-3" />
                    <div>
                      <h5 className="mb-0">{selectedConvInfo?.name}</h5>
                      <small className="text-muted">{getOnlineStatus(selectedConversation)}</small>
                    </div>
                  </div>
                  {/* Dropdown menu for conversation actions */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as="button"
                      className="btn btn-link text-dark p-0 border-0"
                      style={{ boxShadow: 'none', background: 'none' }}
                      bsPrefix="custom-dropdown"
                    >
                      <ThreeDotsVertical size={20} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {/* TODO: Replace with actual user profile link when API is ready
                          This should link to /profile/{userId} or similar endpoint */}
                      <Dropdown.Item
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log(`View profile for: ${selectedConvInfo?.name}`);
                          // TODO: Navigate to actual profile page: router.push(`/profile/${selectedConvInfo?.userId}`);
                        }}
                      >
                        <PersonFill className="me-2" />
                        View Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        className="text-warning"
                        onClick={() => {
                          console.log(`Block user: ${selectedConvInfo?.name}`);
                          // TODO: Implement block user functionality
                        }}
                      >
                        <ShieldX className="me-2" />
                        Block User
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => {
                          console.log(`Report user: ${selectedConvInfo?.name}`);
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
                {currentMessages.map((message, index) => {
                  const showDateHeader = index === 0 || currentMessages[index - 1].date !== message.date;
                  return (
                    <div key={message.id}>
                      {showDateHeader && (
                        <div className="text-center my-3">
                          <Badge bg="secondary" className="px-3 py-2">
                            {message.date}
                          </Badge>
                        </div>
                      )}
                      <div
                        // eslint-disable-next-line max-len
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
                    </div>
                  );
                })}
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
                  {/* Remove note when messaging functionality is implemented */}
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
