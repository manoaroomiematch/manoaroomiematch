import { Row, Col, Container } from 'react-bootstrap';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => (
  <footer className="mt-auto py-2 text-white" style={{ backgroundColor: '#0d5c36' }}>
    <Container>
      <Row>
        <Col className="text-center small">
          <strong>Mānoa Roomie Match</strong>
          <br />
          ICS 314 - Department of Information and Computer Sciences
          <br />
          University of Hawaii
          <br />
          Honolulu, HI 96822
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
