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
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="mb-3">Lifestyle Categories</h1>
        <p className="lead text-muted">
          Explore these lifestyle categories to better understand what aspects are considered when matching with potential roommates.
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
                <Card.Body>
                  <Card.Title className="fw-bold text-dark mb-3">
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    {renderDescriptionWithLinks(category.description || 'No description available')}
                  </Card.Text>
                  {/* Quick Links Section */}
                  <div className="mt-3 pt-2 border-top">
                    <h6 className="fw-bold mb-2" style={{ fontSize: '1rem' }}>Quick Links:</h6>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <a
                          href={`/resources?category=${encodeURIComponent(category.name)}`}
                          className="text-decoration-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          → Learn more about
                          {' '}
                          {category.name}
                        </a>
                      </li>
                      <li>
                        <a
                          href={`/search?category=${encodeURIComponent(category.name)}`}
                          className="text-decoration-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          → Find resources for
                          {' '}
                          {category.name}
                        </a>
                      </li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default LifestyleCategoriesTips;
