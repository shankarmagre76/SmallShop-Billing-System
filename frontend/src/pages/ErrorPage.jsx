import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const ErrorPage = ({ message = "An unexpected error occurred.", onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="card shadow border-0 rounded-4 p-4 text-center" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mx-auto mb-3">
          <i className="bi bi-exclamation-triangle-fill fs-1"></i>
        </div>

        <h3 className="fw-bold mb-2">Something Went Wrong</h3>
        <p className="text-muted small mb-4">{message}</p>

        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {onRetry && (
            <button onClick={onRetry} className="btn btn-outline-primary px-3">
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry
            </button>
          )}

          <Link to={ROUTES.DASHBOARD} className="btn btn-primary px-3">
            <i className="bi bi-house-door me-1"></i>
            Go to Dashboard
          </Link>

          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary px-3">
            <i className="bi bi-arrow-left me-1"></i>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
