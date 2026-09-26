import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getHealthCheck } from "../../services/healthService";
import { ROUTES } from "../../constants/routes";

const TopNavbar = ({ toggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [apiHealth, setApiHealth] = useState({ loading: true, connected: false });

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const res = await getHealthCheck();
      if (isMounted) {
        setApiHealth({ loading: false, connected: res.connected });
      }
    };

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark px-3 border-bottom border-secondary shadow-sm"
      style={{ height: "var(--navbar-height)" }}
    >
      <div className="container-fluid p-0">
        {/* Left Section: Mobile Menu Toggle & Brand */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-dark d-lg-none me-1 p-1 border-0"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <i className="bi bi-list fs-3 text-light"></i>
          </button>

          <Link
            className="navbar-brand fw-bold d-flex align-items-center gap-2 m-0 fs-5"
            to={ROUTES.DASHBOARD}
          >
            <i className="bi bi-shop text-primary fs-4"></i>
            <span>Small Shop Billing</span>
          </Link>
        </div>

        {/* Right Section: API Health Badge & User Profile Dropdown */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* API Health Connection Indicator */}
          <div className="d-none d-sm-flex align-items-center gap-2 px-2 py-1 bg-secondary bg-opacity-25 rounded border border-secondary border-opacity-50">
            <span
              className={`spinner-grow spinner-grow-sm ${
                apiHealth.loading
                  ? "text-warning"
                  : apiHealth.connected
                  ? "text-success"
                  : "text-danger"
              }`}
              role="status"
              style={{ width: "8px", height: "8px" }}
            ></span>
            <span className="small text-light fw-medium">
              API:{" "}
              {apiHealth.loading
                ? "Checking..."
                : apiHealth.connected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          {/* User Profile Dropdown */}
          {isAuthenticated && (
            <div className="dropdown">
              <button
                className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2 py-1 px-2 border-secondary"
                type="button"
                id="topUserDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle fs-5 text-primary"></i>
                <span className="fw-semibold">{user?.fullName || "Staff Member"}</span>
                {user?.role && (
                  <span className="badge bg-primary ms-1">{user.role}</span>
                )}
              </button>

              <ul
                className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2 p-2"
                aria-labelledby="topUserDropdown"
                style={{ minWidth: "220px" }}
              >
                <li className="px-3 py-2 bg-light rounded-2 mb-2">
                  <div className="fw-bold text-dark text-truncate">
                    {user?.fullName || "User"}
                  </div>
                  <div className="text-muted small text-truncate">
                    {user?.email || "No email"}
                  </div>
                  <div className="mt-1">
                    <span className="badge bg-primary text-uppercase">
                      Role: {user?.role || "Staff"}
                    </span>
                  </div>
                </li>
                <li>
                  <hr className="dropdown-divider my-1" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2 rounded-2 py-2"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
