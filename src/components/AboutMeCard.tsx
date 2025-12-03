'use client';

import { Card, Badge, Row, Col } from 'react-bootstrap';
import {
  GeoAlt,
  Instagram,
  Snapchat,
  ChatDots,
  Stars,
} from 'react-bootstrap-icons';

interface AboutMeCardProps {
  bio?: string;
  hometown?: string;
  instagram?: string;
  snapchat?: string;
  interests?: string[];
}

const AboutMeCard: React.FC<AboutMeCardProps> = ({
  bio,
  hometown,
  instagram,
  snapchat,
  interests,
}) => (
  <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
    <Card.Body className="p-4">
      <h4 className="fw-bold mb-4">About Me</h4>

      {/* Bio Section */}
      {bio && (
        <Row className="g-4 mb-4">
          <Col xs={12}>
            <h6 className="fw-bold text-muted mb-2">
              <ChatDots className="me-2" />
              Bio
            </h6>
            <p className="mb-0">{bio}</p>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        {/* Hometown */}
        {hometown && (
          <Col md={6}>
            <h6 className="fw-bold text-muted mb-2">
              <GeoAlt className="me-2" />
              From
            </h6>
            <p>{hometown}</p>
          </Col>
        )}

        {/* Social Media */}
        {(instagram || snapchat) && (
          <Col md={6}>
            <h6 className="fw-bold text-muted mb-2">
              Social Media
            </h6>
            <ul className="list-unstyled mb-0">
              {instagram && (
                <li className="mb-1">
                  <Instagram className="me-2" />
                  {instagram}
                </li>
              )}
              {snapchat && (
                <li>
                  <Snapchat className="me-2" />
                  {snapchat}
                </li>
              )}
            </ul>
          </Col>
        )}

        {/* Interests & Hobbies */}
        {interests && interests.length > 0 && (
          <Col xs={12}>
            <h6 className="fw-bold text-muted mb-2">
              <Stars className="me-2" />
              Interests & Hobbies
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {interests.map((item) => (
                <Badge key={item} bg="success" className="px-3 py-2">
                  {item}
                </Badge>
              ))}
            </div>
          </Col>
        )}
      </Row>
    </Card.Body>
  </Card>
);

export default AboutMeCard;
