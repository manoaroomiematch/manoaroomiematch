import { Col, Container } from 'react-bootstrap';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => (
  <footer className="mt-auto py-2 bg-success text-white">
    <Container>
      <Col className="text-center small">
        <strong>Mānoa Roomie Match</strong>
        <br />
        ICS 314 - Department of Information and Computer Sciences
        <br />
        University of Hawaii
        <br />
        Honolulu, HI 96822
        <br />
        <a
          href="http://ics-software-engineering.github.io/nextjs-application-template"
          className="text-white text-decoration-none"
        >
          Template Home Page
        </a>
      </Col>
    </Container>
  </footer>
);

export default Footer;
