/* eslint-disable consistent-return */
/**
 * UPDATED SurveyConfirmation Component
 *
 * This version automatically generates matches when the user completes the survey.
 *
 * Changes from original:
 * 1. Calls match generation API on component mount
 * 2. Shows loading state while generating matches
 * 3. Displays match statistics
 * 4. Provides button to view matches
 *
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Row, Badge, Spinner, Alert } from 'react-bootstrap';
import { CheckCircleFill, PencilSquare, ArrowClockwise, PeopleFill, StarFill } from 'react-bootstrap-icons';
import { useRouter } from 'next/navigation';

interface LifestyleSurveyData {
  sleepSchedule: string;
  noiseTolerance: number;
  cleanliness: string;
  studyHabits: string;
  socialLevel: string;
  guestPolicy: string;
}

interface MatchStats {
  totalMatches: number;
  highMatches: number;
  mediumMatches: number;
  lowMatches: number;
  averageScore: number;
}

const SurveyConfirmation: React.FC = () => {
  const router = useRouter();
  const [surveyData, setSurveyData] = useState<LifestyleSurveyData | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showRedoConfirm, setShowRedoConfirm] = useState(false);

  // Match generation state
  const [generatingMatches, setGeneratingMatches] = useState(true);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    // Load completed survey data from localStorage
    const savedData = localStorage.getItem('lifestyle-survey-completed');
    if (savedData) {
      setSurveyData(JSON.parse(savedData));
    } else {
      // If no data found, redirect back to survey
      router.push('/lifestyle-survey');
      return;
    }

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  // Auto-generate matches on mount
  useEffect(() => {
    async function generateMatches() {
      try {
        setGeneratingMatches(true);
        setMatchError(null);

        // Check if matches were already generated for this session
        const matchesGenerated = sessionStorage.getItem('matches-generated');

        if (matchesGenerated === 'true') {
          // Just fetch stats
          const statsResponse = await fetch('/api/matches/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'stats' }),
          });

          if (statsResponse.ok) {
            const data = await statsResponse.json();
            setMatchStats(data.stats);
          }
          setGeneratingMatches(false);
          return;
        }

        // Generate new matches
        const response = await fetch('/api/matches/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate' }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate matches');
        }

        const data = await response.json();
        setMatchStats(data.stats);

        // Mark as generated for this session
        sessionStorage.setItem('matches-generated', 'true');

        console.log(`Generated ${data.matchesCreated} matches successfully`);
      } catch (error) {
        console.error('Error generating matches:', error);
        setMatchError('Could not generate matches automatically. You can try again from your profile.');
      } finally {
        setGeneratingMatches(false);
      }
    }

    if (surveyData) {
      generateMatches();
    }
  }, [surveyData]);

  const handleEditAnswers = () => {
    router.push('/lifestyle-survey/edit');
  };

  const handleRedoSurvey = () => {
    setShowRedoConfirm(true);
  };

  const confirmRedoSurvey = () => {
    // Clear completed survey data
    localStorage.removeItem('lifestyle-survey-completed');
    // Clear any existing draft
    localStorage.removeItem('lifestyle-survey-draft');
    // Clear match generation flag
    sessionStorage.removeItem('matches-generated');
    // Redirect to survey start
    router.push('/lifestyle-survey');
  };

  const cancelRedoSurvey = () => {
    setShowRedoConfirm(false);
  };

  const formatLabel = (key: string, value: string | number): string => {
    if (key === 'noiseTolerance') {
      return `${value}/100`;
    }
    return String(value)
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getQuestionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      sleepSchedule: 'Sleep Schedule',
      noiseTolerance: 'Noise Tolerance',
      cleanliness: 'Cleanliness',
      studyHabits: 'Study Preferences',
      socialLevel: 'Social Level',
      guestPolicy: 'Guest Policy',
    };
    return labels[key] || key;
  };

  if (!surveyData) {
    return null;
  }

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <style>
          {`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }

          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            top: -10px;
            z-index: 9999;
            pointer-events: none;
            animation: confetti-fall 3s linear forwards;
          }

          .confetti:nth-child(1) { left: 10%; background: #ff6b6b; animation-delay: 0s; }
          .confetti:nth-child(2) { left: 20%; background: #4ecdc4; animation-delay: 0.2s; }
          .confetti:nth-child(3) { left: 30%; background: #45b7d1; animation-delay: 0.4s; }
          .confetti:nth-child(4) { left: 40%; background: #f9ca24; animation-delay: 0.6s; }
          .confetti:nth-child(5) { left: 50%; background: #6c5ce7; animation-delay: 0.8s; }
          .confetti:nth-child(6) { left: 60%; background: #a29bfe; animation-delay: 1s; }
          .confetti:nth-child(7) { left: 70%; background: #fd79a8; animation-delay: 1.2s; }
          .confetti:nth-child(8) { left: 80%; background: #fdcb6e; animation-delay: 1.4s; }
          .confetti:nth-child(9) { left: 90%; background: #e17055; animation-delay: 1.6s; }
          .confetti:nth-child(10) { left: 95%; background: #00b894; animation-delay: 1.8s; }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          .success-icon {
            animation: pulse 1s ease-in-out;
          }
        `}
        </style>
      )}

      {showConfetti && (
        <div>
          {Array.from({ length: 10 }).map((_, i) => {
            const confettiId = `confetti-${Math.random()}-${i}`;
            return <div key={confettiId} className="confetti" />;
          })}
        </div>
      )}

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={7}>
            {/* Success Message */}
            <div className="text-center mb-4">
              <CheckCircleFill
                className="success-icon text-success mb-3"
                size={80}
              />
              <h2 className="mb-2">Survey Completed! 🎉</h2>
              <p className="text-muted">
                Your lifestyle preferences have been saved successfully.
              </p>
            </div>

            {/* Match Generation Status */}
            {generatingMatches && (
              <Alert variant="info" className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-3" />
                <div>
                  <strong>Finding your matches...</strong>
                  <br />
                  <small>We&apos;re analyzing your preferences to find compatible roommates.</small>
                </div>
              </Alert>
            )}

            {matchError && (
              <Alert variant="warning">
                <strong>Note:</strong>
                {' '}
                {matchError}
              </Alert>
            )}

            {/* Match Statistics */}
            {matchStats && !generatingMatches && (
              <Card className="mb-4 shadow-sm border-success" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-4">
                  <div className="text-center mb-3">
                    <PeopleFill size={48} className="text-success mb-2" />
                    <h4 className="mb-1">
                      {matchStats.totalMatches}
                      {' '}
                      Matches Found!
                    </h4>
                    <p className="text-muted mb-0">
                      Average compatibility:
                      {' '}
                      {matchStats.averageScore}
                      %
                    </p>
                  </div>

                  <Row className="g-3 mt-2">
                    <Col xs={4}>
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <StarFill className="text-success mb-1" size={24} />
                        <div className="fw-bold">{matchStats.highMatches}</div>
                        <small className="text-muted">High (80%+)</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <StarFill className="text-warning mb-1" size={24} />
                        <div className="fw-bold">{matchStats.mediumMatches}</div>
                        <small className="text-muted">Medium (60-79%)</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="text-center p-3 bg-secondary bg-opacity-10 rounded">
                        <StarFill className="text-secondary mb-1" size={24} />
                        <div className="fw-bold">{matchStats.lowMatches}</div>
                        <small className="text-muted">Other (&lt;60%)</small>
                      </div>
                    </Col>
                  </Row>

                  <div className="text-center mt-4">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => router.push('/matches')}
                    >
                      Browse My Matches
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="mb-4 shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
              <Card.Body className="p-4">
                <h5 className="mb-3">Manage Your Profile</h5>
                <div className="d-grid gap-3">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={handleEditAnswers}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <PencilSquare className="me-2" size={20} />
                    Edit My Answers
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={handleRedoSurvey}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <ArrowClockwise className="me-2" size={20} />
                    Redo Survey from Scratch
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Survey Summary */}
            <Card className="shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
              <Card.Body className="p-4">
                <h5 className="mb-4">Your Answers Summary</h5>
                <Row className="g-3">
                  {Object.entries(surveyData).map(([key, value]) => (
                    <Col xs={12} sm={6} key={key}>
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block mb-1">
                          {getQuestionLabel(key)}
                        </small>
                        <Badge bg="primary" className="px-2 py-2">
                          {formatLabel(key, value)}
                        </Badge>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Navigation Button */}
            <div className="text-center mt-4">
              <Button
                variant="outline-success"
                size="lg"
                onClick={() => router.push('/profile')}
              >
                Go to My Profile
              </Button>
            </div>
          </Col>
        </Row>

        {/* Redo Confirmation Modal */}
        {showRedoConfirm && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={cancelRedoSurvey}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelRedoSurvey();
            }}
            role="button"
            tabIndex={0}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Redo Survey?</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={cancelRedoSurvey}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to redo the entire survey?
                    This will clear all your current answers and you&apos;ll need to regenerate your matches.
                  </p>
                  <p className="text-muted mb-0">
                    <small>
                      Note: You can use &quot;Edit My Answers&quot; if you just want to change specific questions.
                    </small>
                  </p>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={cancelRedoSurvey}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={confirmRedoSurvey}>
                    Yes, Start Over
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
};

export default SurveyConfirmation;
