/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */

'use client';

import { useState } from 'react';
import { Card, Button, Spinner, ListGroup } from 'react-bootstrap';

interface IcebreakersBoxProps {
  matchId: string;
  icebreakers?: string[];
}

export default function IcebreakersBox({ matchId, icebreakers }: IcebreakersBoxProps) {
  const [questions, setQuestions] = useState(icebreakers || []);
  const [loading, setLoading] = useState(false);

  const generateIcebreakers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/ai-report`, {
        method: 'POST',
      });
      const data = await res.json();
      setQuestions(data.icebreakers);
    } catch (err) {
      console.error('Error generating icebreakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultQuestions = [
    "What's your ideal living environment?",
    'How do you like to spend your weekends?',
    "What's important to you in a roommate?",
  ];

  const displayQuestions = questions.length > 0 ? questions : defaultQuestions;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: '12px' }}>
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="bg-success rounded d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', flexShrink: 0 }}
          >
            <i className="bi bi-chat-dots text-white" style={{ fontSize: '1.25rem' }} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Conversation Starters</h4>
            <small className="text-muted">Break the ice with these questions</small>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p className="text-muted mb-0">Creating conversation starters...</p>
            <small className="text-muted">Personalizing questions for you</small>
          </div>
        ) : (
          <>
            <ListGroup className="mb-3">
              {displayQuestions.map((question, idx) => (
                <ListGroup.Item
                  key={idx}
                  className="d-flex align-items-start gap-3 border-success border-2 bg-light mb-2"
                  style={{ borderRadius: '8px' }}
                >
                  <div
                    className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: '32px',
                      height: '32px',
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-grow-1 pt-1">
                    <p className="mb-0 fw-medium">{question}</p>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-success p-0"
                    onClick={() => copyToClipboard(question)}
                    title="Copy question"
                    style={{ flexShrink: 0 }}
                  >
                    <i className="bi bi-clipboard" style={{ fontSize: '1.25rem' }} />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            {questions.length === 0 && (
              <div className="text-center">
                <Button
                  variant="outline-success"
                  onClick={generateIcebreakers}
                >
                  Generate Personalized Questions
                </Button>
                <p className="text-muted small mt-2 mb-0">
                  Get AI-powered questions based on your compatibility
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer Tip */}
        {!loading && (
          <Card className="bg-light border-0 mt-3">
            <Card.Body className="p-3">
              <div className="d-flex align-items-start gap-2 small">
                <i className="bi bi-info-circle text-success" style={{ fontSize: '1.25rem', flexShrink: 0 }} />
                <p className="mb-0">
                  <strong>Pro tip:</strong>
                  {' '}
                  Use these questions to start a conversation and learn more about your potential roommate&apos;s living preferences.
                </p>
              </div>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
}
