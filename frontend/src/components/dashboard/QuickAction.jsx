import React from "react";
import { Link } from "react-router-dom";

const QuickAction = ({ title, description, icon, to, badge }) => {
  return (
    <Link to={to} className="quick-action-card shadow-sm rounded-3 text-decoration-none">
      <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0">
        <i className={`bi ${icon} fs-4`}></i>
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <h6 className="fw-bold mb-0 text-dark">{title}</h6>
          {badge && <span className="badge bg-secondary extra-small">{badge}</span>}
        </div>
        <p className="text-muted small mb-0 text-truncate">{description}</p>
      </div>
      <i className="bi bi-chevron-right text-muted fs-6"></i>
    </Link>
  );
};

export default QuickAction;
