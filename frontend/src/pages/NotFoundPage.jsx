import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="card shadow border-0 rounded-4 p-4 p-md-5 text-center" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle d-inline-block mx-auto mb-3">
          <i className="bi bi-compass fs-1"></i>
        </div>

        <h1 className="display-4 fw-bold text-primary mb-1">404</h1>
        <h3 className="fw-bold mb-2">Page Not Found</h3>
        <p className="text-muted small mb-4">
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="d-flex flex-wrap gap-2 justify-content-center">
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

export default NotFoundPage;
