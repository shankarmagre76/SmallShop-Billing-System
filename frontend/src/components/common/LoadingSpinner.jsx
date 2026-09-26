import React from "react";

const LoadingSpinner = ({ message = "Loading data...", size = "border-sm" }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${size}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="text-muted mt-2 mb-0 small">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
