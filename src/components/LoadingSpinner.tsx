import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => (
  <div className="d-flex flex-column align-items-center justify-content-center gap-2">
    <Spinner animation="border" />
    <span>Getting data</span>
  </div>
);

export default LoadingSpinner;
