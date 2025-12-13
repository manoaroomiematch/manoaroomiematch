const LoadingSpinner = () => (
  <div className="d-flex flex-column align-items-center justify-content-center gap-2">
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-3">Getting data...</p>
  </div>
);

export default LoadingSpinner;
