'use client';

import { Button, Card } from 'react-bootstrap';
import { ClipboardCheck } from 'react-bootstrap-icons';
import { useRouter } from 'next/navigation';

const LifestyleSurveyButton: React.FC = () => {
  const router = useRouter();

  const handleNavigateToSurvey = () => {
    router.push('/lifestyle-survey');
  };

  return (
    <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
      <Card.Body className="p-3 text-center">
        <ClipboardCheck size={36} className="text-success mb-2" />
        <h6 className="mb-2">Lifestyle Survey</h6>
        <p className="text-muted mb-3 small">
          Complete or update your lifestyle preferences to help us find your perfect roommate match.
        </p>
        <Button
          variant="success"
          onClick={handleNavigateToSurvey}
          className="px-4"
        >
          Go to Lifestyle Survey
        </Button>
      </Card.Body>
    </Card>
  );
};

export default LifestyleSurveyButton;
