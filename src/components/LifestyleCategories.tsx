/* eslint-disable max-len */

'use client';

/* eslint-disable react/require-default-props */
/**
 * LifestyleCategoriesTips Component
 * Displays lifestyle categories for users (read-only)
 * Shows category name and description, sorted alphabetically
 */
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

interface Category {
  id: number;
  name: string;
  description?: string;
}

const renderDescriptionWithLinks = (text: string) => {
  // Regular expression to match markdown-style links [text](url)
  const markdownLinkRegex = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  // First, handle markdown-style links
  let matchResult;
  const markdownMatches: Array<{ match: string; text: string; url: string; index: number; length: number }> = [];

  // eslint-disable-next-line no-cond-assign
  while ((matchResult = markdownLinkRegex.exec(text)) !== null) {
    markdownMatches.push({
      match: matchResult[0],
      text: matchResult[1],
      url: matchResult[2],
      index: matchResult.index,
      length: matchResult[0].length,
    });
  }

  // Process markdown matches
  markdownMatches.forEach((markdownMatch) => {
    if (markdownMatch.index > lastIndex) {
      result.push(
        <span key={`text-${lastIndex}-${markdownMatch.index}`}>
          {text.substring(lastIndex, markdownMatch.index)}
        </span>,
      );
    }
    result.push(
      <a
        key={`link-${markdownMatch.index}`}
        href={markdownMatch.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-decoration-none"
      >
        {markdownMatch.text}
      </a>,
    );
    lastIndex = markdownMatch.index + markdownMatch.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(
      <span key={`text-final-${lastIndex}`}>
        {text.substring(lastIndex)}
      </span>,
    );
  }

  return result.length > 0 ? result : text;
};

const LifestyleCategoriesTips: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/lifestyle/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load lifestyle categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <Container className="py-5">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <Container className="py-5">
        <div className="mb-5">
          <h1 className="mb-3 fw-bold">Campus Life</h1>
          <p className="lead text-muted">
            Find key information for living on campus, including housing documents, move-in details, community expectations, dining, maintenance support, staff contacts, campus services, and job opportunities.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {categories.length === 0 ? (
          <Alert variant="info">No lifestyle categories available at this time.</Alert>
        ) : (
          <Row className="g-4">
            {categories.map((category) => (
              <Col md={6} lg={4} key={category.id}>
                <Card className="h-100 shadow-sm border-0" style={{ transition: 'transform 0.2s' }}>
                  <Card.Header className="bg-success bg-opacity-10 border-0 py-3">
                    <Card.Title className="fw-bold text-success mb-0">
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Card.Text className="text-muted">
                      {renderDescriptionWithLinks(category.description || 'No description available')}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </main>
  );
};

export default LifestyleCategoriesTips;
