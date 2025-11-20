'use client';

import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

// TYPE DEFINITIONS
interface LifestyleSurveyData {
  sleepSchedule: string;
  noiseTolerance: number;
  cleanliness: string;
  studyHabits: string;
  socialLevel: string;
  guestPolicy: string;
}

// Steps configuration
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

const LifestyleSurvey: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<LifestyleSurveyData>({
    sleepSchedule: '',
    noiseTolerance: 50,
    cleanliness: '',
    studyHabits: '',
    socialLevel: '',
    guestPolicy: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = SURVEY_STEPS.length;

  // Handle input changes
  const handleInputChange = (key: keyof LifestyleSurveyData, value: string | number) => {
    setSurveyData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Survey submitted:', surveyData);

      // Show success message
      console.log('Survey completed successfully!');
    } catch (error) {
      console.error('Error submitting survey:', error);
      console.log('Error submitting survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current step is complete
  const isStepComplete = () => {
    const currentStepData = SURVEY_STEPS[currentStep];
    return currentStepData.questions.every(question => {
      const value = surveyData[question.key as keyof LifestyleSurveyData];
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const currentStepData = SURVEY_STEPS[currentStep];

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="text-center mb-4">
            <h2>Profile Setup</h2>
            <p className="text-muted">
              Step
              {' '}
              {currentStep + 1}
              {' '}
              of
              {' '}
              {totalSteps}
            </p>
          </div>

          <Card>
            <Card.Body>
              <div className="mb-4">
                <h4>{currentStepData.title}</h4>
              </div>

              <Form>
                {currentStepData.questions.map((question) => (
                  <Form.Group key={question.key} className="mb-4">
                    <Form.Label as="legend">{question.label}</Form.Label>

                    {question.type === 'radio' && question.options && (
                      <div>
                        {question.options.map((option) => (
                          <Form.Check
                            key={option.value}
                            type="radio"
                            id={`${question.key}-${option.value}`}
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

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between mt-4">
                <Button
                  variant="secondary"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>

                {currentStep === totalSteps - 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!isStepComplete() || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Survey'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={goToNextStep}
                    disabled={!isStepComplete()}
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LifestyleSurvey;
