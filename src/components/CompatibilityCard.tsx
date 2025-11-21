'use client';

import { Card, Row, Col, Badge } from 'react-bootstrap';

const CompatibilityCard: React.FC = () => (
  <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: '12px' }}>
    <Card.Body className="p-4">
      <h2 className="fw-bold mb-4 text-center">Compatibility Highlights</h2>

      <Row className="g-4">
        {/* Shared Interests */}
        <Col xs={12} sm={6}>
          <h5 className="fw-semibold mb-3">Interests</h5>
          <div className="d-flex flex-wrap gap-2">
            <Badge bg="light" text="dark" className="px-3 py-2">Coding</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2">Hiking</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2">Matcha Lattes</Badge>
          </div>
        </Col>

        {/* Complementary Traits */}
        <Col xs={12} sm={6}>
          <h5 className="fw-semibold mb-3">Personalities</h5>
          <div className="d-flex flex-wrap gap-2">
            <Badge bg="light" text="dark" className="px-3 py-2">Adventurous</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2">Creative Thinker</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2">Good Listener</Badge>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default CompatibilityCard;
