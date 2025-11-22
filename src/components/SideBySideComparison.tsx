/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-array-index-key */

import { UserProfile } from '@/types';
import Image from 'next/image';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';

interface CategoryBreakdown {
  category: string;
  yourValue: string | number;
  theirValue: string | number;
  compatibility: number;
  description: string;
}

interface SideBySideComparisonProps {
  currentUser: UserProfile;
  matchUser: UserProfile;
  categoryBreakdown: CategoryBreakdown[];
  overallScore: number;
}

export default function SideBySideComparison({
  currentUser,
  matchUser,
  categoryBreakdown,
  overallScore,
}: SideBySideComparisonProps) {
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('personality') || categoryLower.includes('energy')) {
      return '👤';
    }
    if (categoryLower.includes('sleep') || categoryLower.includes('habits')) {
      return '🛌';
    }
    if (categoryLower.includes('clean') || categoryLower.includes('room')) {
      return '🏠';
    }
    if (categoryLower.includes('study') || categoryLower.includes('work')) {
      return '📚';
    }
    if (categoryLower.includes('social')) {
      return '👥';
    }
    return '📋';
  };

  const getCompatibilityBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: '12px' }}>
      <Card.Body className="p-0">
        {/* Header with User Names */}
        <div className="bg-success text-white">
          <Row className="g-0">
            {/* Current User Header */}
            <Col xs={6} className="border-end border-white border-opacity-25">
              <div className="p-4 text-center">
                <div className="mb-3">
                  {currentUser.photoUrl ? (
                    <Image
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      width={80}
                      height={80}
                      className="rounded-circle border border-3 border-white"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <PersonCircle size={80} className="text-white" />
                  )}
                </div>
                <h4 className="fw-bold mb-0">{currentUser.name}</h4>
              </div>
            </Col>

            {/* Match User Header */}
            <Col xs={6}>
              <div className="p-4 text-center">
                <div className="mb-3">
                  {matchUser.photoUrl ? (
                    <Image
                      src={matchUser.photoUrl}
                      alt={matchUser.name}
                      width={80}
                      height={80}
                      className="rounded-circle border border-3 border-white"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <PersonCircle size={80} className="text-white" />
                  )}
                </div>
                <h4 className="fw-bold mb-0">{matchUser.name}</h4>
              </div>
            </Col>
          </Row>
        </div>

        {/* Categories Comparison */}
        <div className="p-3">
          {categoryBreakdown.map((category, idx) => (
            <Card key={idx} className="mb-3 border-0 bg-light">
              <Card.Body className="p-3">
                {/* Category Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon(category.category)}</span>
                    <div>
                      <h6 className="fw-bold mb-0">{category.category}</h6>
                      <small className="text-muted">{category.description}</small>
                    </div>
                  </div>
                  <Badge
                    bg={getCompatibilityBadge(category.compatibility)}
                    className="px-3 py-2"
                  >
                    {category.compatibility}
                    %
                  </Badge>
                </div>

                {/* Side by Side Values */}
                <Row className="g-2">
                  <Col xs={6}>
                    <Card className="border-success border-2 h-100">
                      <Card.Body className="p-3">
                        <small className="text-muted d-block mb-1">Your Preference</small>
                        <div className="fw-semibold">{category.yourValue}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6}>
                    <Card className="border-success border-2 h-100">
                      <Card.Body className="p-3">
                        <small className="text-muted d-block mb-1">Their Preference</small>
                        <div className="fw-semibold">{category.theirValue}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
