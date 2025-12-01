'use client';

import { Card, Badge, Row, Col } from 'react-bootstrap';
import {
  Briefcase,
  CupStraw,
  EmojiSmile,
  EggFried,
} from 'react-bootstrap-icons';

interface AboutMeCardProps {
  workSchedule?: string;
  smoking?: boolean;
  drinking?: string;
  pets?: boolean;
  petTypes?: string[];
  dietary?: string[];
}

const AboutMeCard: React.FC<AboutMeCardProps> = ({
  workSchedule,
  smoking,
  drinking,
  pets,
  petTypes,
  dietary,
}) => (
  <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
    <Card.Body className="p-4">
      <h4 className="fw-bold mb-4">About Me</h4>

      <Row className="g-4">
        <Col md={6}>
          <h6 className="fw-bold text-muted mb-2">
            <Briefcase className="me-2" />
            Work Schedule
          </h6>
          <p className="text-capitalize">{workSchedule || 'Not specified'}</p>
        </Col>

        <Col md={6}>
          <h6 className="fw-bold text-muted mb-2">
            <CupStraw className="me-2" />
            Habits
          </h6>
          <ul className="list-unstyled mb-0">
            <li>
              Smoking:
              {' '}
              {smoking ? 'Yes' : 'No'}
            </li>
            <li>
              Drinking:
              {' '}
              <span className="text-capitalize">{drinking || 'Not specified'}</span>
            </li>
          </ul>
        </Col>

        <Col md={6}>
          <h6 className="fw-bold text-muted mb-2">
            <EmojiSmile className="me-2" />
            Pets
          </h6>
          <p>
            {pets ? 'Has pets' : 'No pets'}
            {pets && petTypes && petTypes.length > 0 && (
            <span className="text-muted">
              {' '}
              (
              {petTypes.join(', ')}
              )
            </span>
            )}
          </p>
        </Col>

        <Col md={6}>
          <h6 className="fw-bold text-muted mb-2">
            <EggFried className="me-2" />
            Dietary
          </h6>
          {dietary && dietary.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {dietary.map((item) => (
                <Badge key={item} bg="light" text="dark" className="border">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p>No specific dietary preferences</p>
          )}
        </Col>

      </Row>
    </Card.Body>
  </Card>
);

export default AboutMeCard;
