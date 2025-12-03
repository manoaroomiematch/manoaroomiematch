'use client';

import { Card, Badge, Row, Col, Alert } from 'react-bootstrap';
import { Calendar3, HouseDoor, Clock } from 'react-bootstrap-icons';

interface HousingHighlightCardProps {
  needRoommateBy?: Date | string;
  housingType?: string;
  preferredDorm?: string;
  specificBuilding?: string;
  budget?: string;
}

const HousingHighlightCard: React.FC<HousingHighlightCardProps> = ({
  needRoommateBy,
  housingType,
  preferredDorm,
  specificBuilding,
  budget,
}) => {
  // Don't show card if no housing info is provided
  if (!needRoommateBy && !housingType) {
    return null;
  }

  // Format the date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Calculate urgency (if date is within 30 days)
  const isUrgent = () => {
    if (!needRoommateBy) return false;
    const date = new Date(needRoommateBy);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  };

  const getHousingTypeLabel = () => {
    switch (housingType) {
      case 'on-campus': return 'On-Campus';
      case 'off-campus': return 'Off-Campus';
      case 'either': return 'Flexible';
      case 'undecided': return 'Exploring Options';
      default: return null;
    }
  };

  return (
    <Card
      className="shadow-sm mb-4"
      style={{
        border: isUrgent() ? '2px solid #198754' : 'none',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      }}
    >
      <Card.Body className="p-3">
        <div className="d-flex align-items-center mb-2">
          <HouseDoor size={20} className="text-success me-2" />
          <h5 className="fw-bold mb-0">Housing Preferences</h5>
          {isUrgent() && (
            <Badge bg="success" className="ms-auto">
              <Clock className="me-1" size={14} />
              Urgent
            </Badge>
          )}
        </div>

        <Row className="g-2">
          {/* Need Roommate By */}
          {needRoommateBy && (
            <Col md={6}>
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: isUrgent() ? '#d1e7dd' : '#ffffff',
                  border: isUrgent() ? '1px solid #198754' : '1px solid #dee2e6',
                }}
              >
                <div className="d-flex align-items-center mb-1">
                  <Calendar3 className="text-success me-2" size={16} />
                  <h6 className="fw-bold mb-0 text-success small">Need Roommate By</h6>
                </div>
                <p className="mb-0 fw-semibold">{formatDate(needRoommateBy)}</p>
              </div>
            </Col>
          )}

          {/* Housing Type & Preferences */}
          {housingType && (
            <Col md={needRoommateBy ? 6 : 12}>
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                }}
              >
                <div className="d-flex align-items-center mb-1">
                  <HouseDoor className="text-success me-2" size={16} />
                  <h6 className="fw-bold mb-0 text-success small">Housing Preference</h6>
                </div>
                <p className="mb-0 fw-semibold">{getHousingTypeLabel()}</p>

                {/* Show specific preferences */}
                <div className="mt-1">
                  {preferredDorm && (
                    <div className="text-muted small">
                      <strong>Preferred:</strong>
                      {' '}
                      {preferredDorm}
                    </div>
                  )}
                  {specificBuilding && (
                    <div className="text-muted small">
                      <strong>Building:</strong>
                      {' '}
                      {specificBuilding}
                    </div>
                  )}
                  {budget && (
                    <div className="text-muted small">
                      <strong>Budget:</strong>
                      {' '}
                      {budget}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          )}
        </Row>

        {isUrgent() && (
          <Alert variant="success" className="mt-2 mb-0 py-1 px-2 small">
            <strong>Active Search:</strong>
            {' '}
            This user is actively looking for a roommate soon!
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default HousingHighlightCard;
