import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking permissions..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization for frontend route navigation
  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-danger shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
          <div className="card-body p-4">
            <i className="bi bi-shield-lock-fill text-danger fs-1 mb-3"></i>
            <h3 className="card-title text-danger">403 - Access Denied</h3>
            <p className="card-text text-muted mb-4">
              You do not have permission to view this page. This section requires{" "}
              <strong>{allowedRoles.join(" or ")}</strong> privileges.
            </p>
            <a href="/dashboard" className="btn btn-primary">
              <i className="bi bi-house-door me-2"></i>
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;
