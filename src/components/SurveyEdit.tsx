'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Row, ListGroup } from 'react-bootstrap';
import { CheckCircleFill, Circle } from 'react-bootstrap-icons';
import { useRouter } from 'next/navigation';

// TYPE DEFINITIONS
interface LifestyleSurveyData {
  sleepSchedule: string;
  noiseTolerance: number;
  cleanliness: string;
  studyHabits: string;
  socialLevel: string;
  guestPolicy: string;
}

// Steps configuration (matching LifestyleSurvey.tsx)
const SURVEY_STEPS = [
  {
    id: 'sleep',
    title: 'Sleep Schedule',
    questions: [
      {
        key: 'sleepSchedule',
        label: 'What is your sleep schedule?',
        type: 'radio' as const,
        options: [
          { value: 'early-bird', label: 'Early bird' },
          { value: 'night-owl', label: 'Night owl' },
          { value: 'neither', label: 'Neither' },
          { value: 'unknown', label: "I don't know" },
        ],
      },
    ],
  },
  {
    id: 'noise',
    title: 'Noise Tolerance',
    questions: [
      {
        key: 'noiseTolerance',
        label: 'How tolerant are you to noise?',
        type: 'range' as const,
        min: 0,
        max: 100,
        labels: ['Not at all', 'Somewhat', 'Very'],
      },
    ],
  },
  {
    id: 'cleanliness',
    title: 'Cleanliness Standards',
    questions: [
      {
        key: 'cleanliness',
        label: 'How would you rate cleanliness?',
        type: 'radio' as const,
        options: [
          { value: 'very-clean', label: 'Very clean' },
          { value: 'slightly-clean', label: 'Slightly clean' },
          { value: 'neither', label: 'Neither' },
          { value: 'slightly-dirty', label: 'Slightly dirty' },
          { value: 'very-dirty', label: 'Very dirty' },
        ],
      },
    ],
  },
  {
    id: 'study',
    title: 'Study Preferences',
    questions: [
      {
        key: 'studyHabits',
        label: 'What are your study preferences?',
        type: 'radio' as const,
        options: [
          { value: 'quiet-study', label: 'Need complete silence' },
          { value: 'background-noise', label: 'Background noise is fine' },
          { value: 'social-study', label: 'Like studying with others' },
          { value: 'flexible', label: 'Flexible' },
        ],
      },
    ],
  },
  {
    id: 'social',
    title: 'Social Preferences',
    questions: [
      {
        key: 'socialLevel',
        label: 'How social are you?',
        type: 'radio' as const,
        options: [
          { value: 'very-social', label: 'Very social - love hanging out' },
          { value: 'somewhat-social', label: 'Somewhat social - occasional hangouts' },
          { value: 'private', label: 'Private - prefer personal space' },
          { value: 'mixed', label: 'Depends on my mood' },
        ],
      },
      {
        key: 'guestPolicy',
        label: 'How do you feel about guests?',
        type: 'radio' as const,
        options: [
          { value: 'frequent-guests', label: 'Frequent guests are fine' },
          { value: 'occasional-guests', label: 'Occasional guests only' },
          { value: 'rare-guests', label: 'Rare guests preferred' },
          { value: 'no-guests', label: 'No guests please' },
        ],
      },
    ],
  },
];

const SurveyEdit: React.FC = () => {
  const router = useRouter();
  const [surveyData, setSurveyData] = useState<LifestyleSurveyData | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load completed survey data from localStorage
    const savedData = localStorage.getItem('lifestyle-survey-completed');
    if (savedData) {
      setSurveyData(JSON.parse(savedData));
    } else {
      // If no data found, redirect back to survey
      router.push('/lifestyle-survey');
    }
  }, [router]);

  const handleInputChange = (key: keyof LifestyleSurveyData, value: string | number) => {
    if (!surveyData) return;

    setSurveyData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleSave = async () => {
    if (!surveyData) return;

    setIsSaving(true);
    try {
      // Save updated data back to localStorage
      localStorage.setItem('lifestyle-survey-completed', JSON.stringify(surveyData));

      // TODO: Also save to backend API
      console.log('Updated survey data:', surveyData);

      // Redirect back to confirmation page
      router.push('/lifestyle-survey/confirmation');
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isQuestionAnswered = (key: string): boolean => {
    if (!surveyData) return false;
    const value = surveyData[key as keyof LifestyleSurveyData];
    return value !== '' && value !== null && value !== undefined;
  };

  if (!surveyData) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row>
        <Col xs={12} className="mb-4">
          <h2>Edit Your Survey Answers</h2>
          <p className="text-muted">
            Select a section below to update your answers
          </p>
        </Col>
      </Row>

      <Row>
        {/* Sidebar - Question Navigation */}
        <Col md={4} lg={3} className="mb-4">
          <Card className="sticky-top" style={{ top: '20px', border: 'none', borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="mb-3">Sections</h6>
              <ListGroup variant="flush">
                {SURVEY_STEPS.map((step, index) => {
                  const allQuestionsAnswered = step.questions.every((q) => isQuestionAnswered(q.key));
                  return (
                    <ListGroup.Item
                      key={step.id}
                      action
                      active={selectedStep === index}
                      onClick={() => setSelectedStep(index)}
                      className="d-flex align-items-center justify-content-between border-0"
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{step.title}</span>
                      {allQuestionsAnswered ? (
                        <CheckCircleFill className="text-success" size={16} />
                      ) : (
                        <Circle className="text-muted" size={16} />
                      )}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content - Selected Question */}
        <Col md={8} lg={9}>
          {selectedStep === null ? (
            <Card className="shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
              <Card.Body className="p-5 text-center">
                <p className="text-muted">Select a section from the left to edit your answers</p>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
              <Card.Body className="p-4">
                <h4 className="mb-4">{SURVEY_STEPS[selectedStep].title}</h4>

                <Form>
                  {SURVEY_STEPS[selectedStep].questions.map((question) => (
                    <Form.Group key={question.key} className="mb-4">
                      <Form.Label as="legend">{question.label}</Form.Label>

                      {question.type === 'radio' && question.options && (
                        <div>
                          {question.options.map((option) => (
                            <Form.Check
                              key={option.value}
                              type="radio"
                              id={`edit-${question.key}-${option.value}`}
                              name={question.key}
                              label={option.label}
                              value={option.value}
                              checked={
                                surveyData[question.key as keyof LifestyleSurveyData] === option.value
                              }
                              onChange={(e) => handleInputChange(
                                question.key as keyof LifestyleSurveyData,
                                e.target.value,
                              )}
                              className="mb-2"
                            />
                          ))}
                        </div>
                      )}

                      {question.type === 'range' && (
                        <div>
                          <Form.Range
                            min={question.min}
                            max={question.max}
                            value={Number(surveyData[question.key as keyof LifestyleSurveyData])}
                            onChange={(e) => handleInputChange(
                              question.key as keyof LifestyleSurveyData,
                              parseInt(e.target.value, 10),
                            )}
                            className="mb-3"
                          />
                          {question.labels && (
                            <div className="d-flex justify-content-between small text-muted">
                              {question.labels.map((label) => (
                                <span key={label}>{label}</span>
                              ))}
                            </div>
                          )}
                          <div className="text-center mt-2">
                            <strong>
                              {surveyData[question.key as keyof LifestyleSurveyData]}
                            </strong>
                          </div>
                        </div>
                      )}
                    </Form.Group>
                  ))}
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Save Button */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/lifestyle-survey/confirmation')}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SurveyEdit;
