/* eslint-disable max-len */

'use client';

/* eslint-disable react/require-default-props */
/**
 * LifestyleCategoriesTips Component
 * Displays lifestyle categories for users (read-only)
 * Shows category name and description, sorted alphabetically
 */
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

// CSS for animations and hover effects
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .category-card {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .category-card:nth-child(1) { animation-delay: 0.1s; }
  .category-card:nth-child(2) { animation-delay: 0.2s; }
  .category-card:nth-child(3) { animation-delay: 0.3s; }
  .category-card:nth-child(4) { animation-delay: 0.4s; }
  .category-card:nth-child(5) { animation-delay: 0.5s; }
  .category-card:nth-child(6) { animation-delay: 0.6s; }
  .category-card:nth-child(7) { animation-delay: 0.7s; }
  .category-card:nth-child(8) { animation-delay: 0.8s; }
  .category-card:nth-child(n+9) { animation-delay: 0.9s; }

  .category-card:hover .grow-card {
    transform: scale(1.035);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .category-card .btn-outline-success:hover {
    transform: scale(1.05);
  }
`;

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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Add cache-busting query parameter to ensure fresh data
      const response = await fetch('/api/lifestyle/categories', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
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

  useEffect(() => {
    // Fetch once on mount
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '0', paddingBottom: '3rem' }}>
        <Container className="pt-3 pb-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading campus life information...</p>
        </Container>
      </main>
    );
  }

  return (
    <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <style>{styles}</style>
      <Container className="pt-3 pb-5">
        <div className="mb-3">
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
            {categories.map((category) => {
              // Extract Learn More link from description
              const learnMoreRegex = /\n?\[Learn More\]\((https?:\/\/[^)]+)\)/i;
              const match = (category.description || '').match(learnMoreRegex);
              const mainDescription = (category.description || '').replace(learnMoreRegex, '').trim();
              const learnMoreLink = match ? match[1] : '';
              return (
                <Col md={6} lg={4} key={category.id} className="category-card">
                  <Card className="h-100 border-0 bg-white grow-card" style={{ transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
                    <Card.Header className="bg-success bg-opacity-10 border-0 py-3">
                      <Card.Title className="fw-bold text-success mb-0">
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text className="text-muted">
                        {renderDescriptionWithLinks(mainDescription || 'No description available')}
                      </Card.Text>
                      {learnMoreLink && (
                        <div className="mt-3">
                          <a
                            href={learnMoreLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-success btn-sm fw-bold"
                            style={{ transition: 'all 0.3s ease' }}
                          >
                            Learn More
                          </a>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </main>
  );
};

export default LifestyleCategoriesTips;
