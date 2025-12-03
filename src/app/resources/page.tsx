'use client';

import { Container, Row, Col, Card } from 'react-bootstrap';
import { HouseFill, ArrowUpRightSquare, BuildingFill } from 'react-bootstrap-icons';
import Image from 'next/image';

/**
 * Resources Page
 *
 * Provides helpful links and information for students looking for housing at UH Manoa.
 * Includes on-campus housing resources, off-campus options, and other useful tools.
 */

const ResourcesPage = () => (
  <main className="bg-light min-vh-100 py-5">
    <Container className="py-4">
      {/* Header Section with decorative graphic */}
      <Row className="align-items-center mb-5">
        <Col xs={12} md={3} lg={2} className="text-center text-md-start mb-3 mb-md-0">
          <Image
            src="/graphic6.png"
            alt="Decorative illustration"
            width={250}
            height={250}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Col>
        <Col xs={12} md={9} lg={10}>
          <div className="text-center text-md-start">
            <h1 className="fw-bold mb-3">Housing Resources</h1>
            <p className="lead text-muted">
              Everything you need to find your perfect home at UH Manoa
            </p>
          </div>
        </Col>
      </Row>

      {/* Featured Resources */}
      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="h-100 shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: '#198754',
                    width: '50px',
                    height: '50px',
                  }}
                >
                  <HouseFill size={24} color="white" />
                </div>
                <h3 className="fw-bold mb-0">UH Student Housing</h3>
              </div>
              <p className="text-muted mb-3">
                Student Housing Services provides on-campus housing options at UH Mānoa. Explore residence halls
                and apartments, compare communities and room types, and apply online. Resources include community
                standards, service requests, roommate resources, and campus safety information.
              </p>
              <a
                href="https://manoa.hawaii.edu/housing/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                Visit Housing Website
                <ArrowUpRightSquare className="ms-2" size={16} />
              </a>
              <div className="mt-3 pt-3 border-top">
                <h6 className="fw-bold mb-2">Quick Links:</h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <a
                      href="https://manoa.hawaii.edu/housing/communities/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Explore Housing Options
                    </a>
                  </li>
                  <li className="mb-2">
                    <a
                      href="https://manoa.hawaii.edu/housing/find-your-community/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Compare Communities & Room Types
                    </a>
                  </li>
                  <li className="mb-2">
                    <a
                      href="https://manoa.hawaii.edu/housing/apply/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Apply for Housing
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://manoa.hawaii.edu/housing/apply/studentfaqs/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Student FAQs
                    </a>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: '#6f42c1',
                    width: '50px',
                    height: '50px',
                  }}
                >
                  <BuildingFill size={24} color="white" />
                </div>
                <h3 className="fw-bold mb-0">Off-Campus Housing</h3>
              </div>
              <p className="text-muted mb-3">
                Search for off-campus apartments and rentals near UH Mānoa. Register to browse listings,
                view property details, and contact landlords. Includes helpful resources for first-time renters,
                tenant rights, and tips to avoid rental scams.
              </p>
              <a
                href="https://offcampushousing.manoa.hawaii.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-purple"
                style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1', color: 'white' }}
              >
                Browse Off-Campus Rentals
                <ArrowUpRightSquare className="ms-2" size={16} />
              </a>
              <div className="mt-3 pt-3 border-top">
                <h6 className="fw-bold mb-2">Quick Links:</h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <a
                      href="https://offcampushousing.manoa.hawaii.edu/registration/member"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Register to Search Listings
                    </a>
                  </li>
                  <li className="mb-2">
                    <a
                      href="https://offcampushousing.manoa.hawaii.edu/resources"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Off-Campus Living Resources
                    </a>
                  </li>
                  <li className="mb-2">
                    <a
                      href="https://offcampushousing.manoa.hawaii.edu/avoid-scams-and-fraud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Avoid Scams & Fraud
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://offcampushousing.manoa.hawaii.edu/support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      → Help Center
                    </a>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Coming Soon Section */}
      <div className="text-center mt-5">
        <p className="text-muted">
          <em>
            More resources coming soon! Check back for student life resources, financial aid information, and more.
          </em>
        </p>
      </div>
    </Container>
  </main>
);

export default ResourcesPage;
