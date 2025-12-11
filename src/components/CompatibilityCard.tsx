'use client';

import { Card, Row, Col, Badge } from 'react-bootstrap';

interface CompatibilityCardProps {
  interests?: string[];
  lifestyle?: {
    cleanliness: number;
    socialLevel: number;
    sleepSchedule: number;
    guestFrequency: number;
  };
}

const CompatibilityCard: React.FC<CompatibilityCardProps> = ({ interests = [], lifestyle }) => {
  // Derive personality traits from lifestyle data
  const personalities: string[] = [];
  if (lifestyle) {
    if (lifestyle.cleanliness > 3) personalities.push('Clean & Tidy');
    if (lifestyle.socialLevel > 3) personalities.push('Social Butterfly');
    if (lifestyle.socialLevel < 3) personalities.push('Introvert');
    if (lifestyle.sleepSchedule > 3) personalities.push('Night Owl');
    if (lifestyle.sleepSchedule < 3) personalities.push('Early Bird');
    if (lifestyle.guestFrequency > 3) personalities.push('Host');
  }

  return (
    <Card className="shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
      <Card.Body className="p-4">
        <h2 className="fw-bold mb-4 text-center">Compatibility Highlights</h2>

        <Row className="g-4">
          {/* Shared Interests */}
          <Col xs={12} sm={6}>
            <h5 className="fw-semibold mb-3">Interests</h5>
            <div className="d-flex flex-wrap gap-2">
              {interests.length > 0 ? (
                interests.map((interest) => (
                  <Badge key={interest} bg="light" text="dark" className="px-3 py-2">
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-muted">No interests listed yet.</p>
              )}
            </div>
          </Col>

          {/* Complementary Traits */}
          <Col xs={12} sm={6}>
            <h5 className="fw-semibold mb-3">Personalities</h5>
            <div className="d-flex flex-wrap gap-2">
              {personalities.length > 0 ? (
                personalities.map((trait) => (
                  <Badge key={trait} bg="light" text="dark" className="px-3 py-2">
                    {trait}
                  </Badge>
                ))
              ) : (
                <p className="text-muted">Complete the lifestyle survey to see traits.</p>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CompatibilityCard;
