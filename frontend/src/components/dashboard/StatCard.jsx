import React from "react";
import { Link } from "react-router-dom";

const StatCard = ({
  title,
  value,
  icon,
  description,
  loading = false,
  link,
  variant = "primary",
}) => {
  const badgeClasses = {
    primary: "bg-primary bg-opacity-10 text-primary",
    warning: "bg-warning bg-opacity-10 text-warning",
    info: "bg-info bg-opacity-10 text-info",
    success: "bg-success bg-opacity-10 text-success",
    danger: "bg-danger bg-opacity-10 text-danger",
  };

  return (
    <div className="card card-stat h-100 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted fw-semibold small">{title}</span>
          <div className={`p-2 rounded-3 ${badgeClasses[variant] || badgeClasses.primary}`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
        </div>

        {loading ? (
          <div className="placeholder-glow my-2">
            <span className="placeholder col-6 fs-3"></span>
          </div>
        ) : (
          <h3 className="fw-bold mb-1">{value !== undefined && value !== null ? value : "—"}</h3>
        )}

        {description && <p className="text-muted small mb-0">{description}</p>}

        {link && (
          <div className="mt-3 pt-2 border-top">
            <Link to={link} className="small text-primary text-decoration-none fw-semibold d-flex align-items-center gap-1">
              <span>View Details</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
