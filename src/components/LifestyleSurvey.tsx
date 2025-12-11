'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Row, ProgressBar } from 'react-bootstrap';
import Image from 'next/image';

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

const STORAGE_KEY = 'lifestyle-survey-draft';

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
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);

  const totalSteps = SURVEY_STEPS.length;

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if survey is already completed and redirect to confirmation page
  useEffect(() => {
    // Allow users to access the survey even if they have a completion flag in localStorage
    // This ensures new signups on the same device can take the survey
    setIsCheckingCompletion(false);
  }, []);

  // Restore from draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setSurveyData(parsed.data);
        setCurrentStep(parsed.step || 0);
        setLastSaved(new Date(parsed.timestamp));
        setShowDraftBanner(true);
        console.log('Draft restored from localStorage');
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
    }
  }, []);

  // Auto-save hook with localStorage and optional API backup
  useEffect(() => {
    const saveData = async () => {
      setIsSaving(true);
      try {
        const timestamp = new Date().toISOString();
        const draftData = {
          data: surveyData,
          step: currentStep,
          timestamp,
        };

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));

        // TODO: Optionally save to backend API
        // await fetch('/api/lifestyle/draft', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(draftData),
        // });

        console.log('Progress auto-saved to localStorage:', surveyData);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error auto-saving:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // Debounce auto-save by 1 second
    const timeoutId = setTimeout(() => {
      // Only save if there's actual data entered
      const hasData = surveyData.sleepSchedule
        || (surveyData.noiseTolerance !== null && surveyData.noiseTolerance !== undefined)
        || surveyData.cleanliness
        || surveyData.studyHabits
        || surveyData.socialLevel
        || surveyData.guestPolicy;

      if (hasData) {
        saveData();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [surveyData, currentStep]);

  // Save data immediately when user navigates away from the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasData = surveyData.sleepSchedule
        || (surveyData.noiseTolerance !== null && surveyData.noiseTolerance !== undefined)
        || surveyData.cleanliness
        || surveyData.studyHabits
        || surveyData.socialLevel
        || surveyData.guestPolicy;

      if (hasData) {
        const draftData = {
          data: surveyData,
          step: currentStep,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      }
    };

    // Save on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also save when component unmounts (navigation within app)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Save on unmount
    };
  }, [surveyData, currentStep]);

  // Handle input changes
  const handleInputChange = (key: keyof LifestyleSurveyData, value: string | number) => {
    setSurveyData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalQuestions = SURVEY_STEPS.reduce(
      (sum, step) => sum + step.questions.length,
      0,
    );
    let answeredQuestions = 0;

    SURVEY_STEPS.forEach(step => {
      step.questions.forEach(question => {
        const value = surveyData[question.key as keyof LifestyleSurveyData];
        if (value !== '' && value !== null && value !== undefined) {
          if (question.type === 'range' && value !== 50) {
            answeredQuestions += 1;
          } else if (question.type === 'radio' && value !== '') {
            answeredQuestions += 1;
          }
        }
      });
    });

    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  // Save data immediately to localStorage
  const saveImmediately = () => {
    const hasData = surveyData.sleepSchedule
      || (surveyData.noiseTolerance !== null && surveyData.noiseTolerance !== undefined)
      || surveyData.cleanliness
      || surveyData.studyHabits
      || surveyData.socialLevel
      || surveyData.guestPolicy;

    if (hasData) {
      const draftData = {
        data: surveyData,
        step: currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      console.log('Data saved immediately');
    }
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      saveImmediately(); // Save before moving to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      saveImmediately(); // Save before moving to previous step
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Survey submitted:', surveyData);

      // Save survey data to localStorage for confirmation page
      localStorage.setItem('lifestyle-survey-completed', JSON.stringify(surveyData));

      // Clear draft from localStorage on successful submission
      localStorage.removeItem(STORAGE_KEY);
      setShowDraftBanner(false);

      // Set flag for new user flow
      localStorage.setItem('just-completed-survey', 'true');

      // Redirect to edit profile page for new users
      window.location.href = '/edit-profile';
    } catch (error) {
      console.error('Error submitting survey:', error);
      console.log('Error submitting survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear draft functionality
  const clearDraft = () => {
    // TODO: Add a proper confirmation modal instead of window.confirm
    localStorage.removeItem(STORAGE_KEY);
    setSurveyData({
      sleepSchedule: '',
      noiseTolerance: 50,
      cleanliness: '',
      studyHabits: '',
      socialLevel: '',
      guestPolicy: '',
    });
    setCurrentStep(0);
    setLastSaved(null);
    setShowDraftBanner(false);
    console.log('Draft cleared');
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

  // Show loading while checking if survey is already completed
  if (isCheckingCompletion) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <Row className="justify-content-center align-items-start">
        {/* Decorative Graphic - Left Side */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="position-sticky" style={{ top: '100px' }}>
            <Image
              src="/graphic4.png"
              alt="Decorative illustration"
              width={300}
              height={300}
              className="img-fluid"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </Col>

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

          {showDraftBanner && (
            <div className="alert alert-info d-flex justify-content-between align-items-center py-2 mb-3">
              <small>
                📝 Draft restored
              </small>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearDraft}
              >
                Clear Draft
              </Button>
            </div>
          )}

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">
                Progress:
                {' '}
                {calculateProgress()}
                %
              </small>
              {isClient && isSaving && (
                <small className="text-muted">
                  <span className="spinner-border spinner-border-sm me-1" />
                  Saving...
                </small>
              )}
              {isClient && !isSaving && lastSaved && (
                <small className="text-success">
                  ✓ Saved
                  {' '}
                  {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              )}
            </div>
            <ProgressBar
              now={calculateProgress()}
              variant="success"
              style={{ height: '8px' }}
            />
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
                    variant="success"
                    onClick={handleSubmit}
                    disabled={!isStepComplete() || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Survey'}
                  </Button>
                ) : (
                  <Button
                    variant="success"
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

        {/* Decorative Graphic */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="position-sticky" style={{ top: '100px' }}>
            <Image
              src="/graphic1.png"
              alt="Decorative illustration"
              width={300}
              height={300}
              className="img-fluid"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LifestyleSurvey;
