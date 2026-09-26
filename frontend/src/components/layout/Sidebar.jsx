import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";

const Sidebar = ({ showMobileSidebar, closeMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "bi-speedometer2" },
    { path: ROUTES.PRODUCTS, label: "Products", icon: "bi-box-seam" },
    { path: ROUTES.INVENTORY, label: "Inventory", icon: "bi-clipboard-data" },
    { path: ROUTES.BILLING, label: "Create Bill", icon: "bi-receipt" },
    { path: ROUTES.BILLS, label: "Bills", icon: "bi-file-earmark-text" },
  ];

  const handleLogout = () => {
    closeMobileSidebar();
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {/* Backdrop for mobile screen when sidebar is active */}
      {showMobileSidebar && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        ></div>
      )}

      <aside className={`sidebar-wrapper ${showMobileSidebar ? "show" : ""}`}>
        <div className="d-flex flex-column h-100 p-3">
          {/* User Info Card in Sidebar */}
          {user && (
            <div className="p-3 mb-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-50">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-person-circle fs-3 text-primary"></i>
                <div className="overflow-hidden">
                  <div className="fw-bold text-white text-truncate small">
                    {user.fullName || "Staff Member"}
                  </div>
                  <div className="text-muted extra-small text-truncate" style={{ fontSize: "0.75rem" }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-2 d-flex align-items-center justify-content-between">
                <span className="badge bg-primary text-uppercase" style={{ fontSize: "0.65rem" }}>
                  {user.role || "Staff"}
                </span>
                <span className="text-success extra-small d-flex align-items-center gap-1" style={{ fontSize: "0.7rem" }}>
                  <span className="spinner-grow spinner-grow-sm text-success" style={{ width: "6px", height: "6px" }}></span>
                  Active Session
                </span>
              </div>
            </div>
          )}

          <div className="text-muted small fw-bold text-uppercase px-2 mb-2">Navigation</div>
          <ul className="nav nav-pills flex-column nav-sidebar mb-auto">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={closeMobileSidebar}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Sidebar Footer with Logout Button */}
          <div className="border-top border-secondary pt-3 mt-auto">
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 btn-sm d-flex align-items-center justify-content-center gap-2 py-2"
            >
              <i className="bi bi-box-arrow-right fs-6"></i>
              <span>Logout</span>
            </button>
            <div className="d-flex align-items-center justify-content-between text-muted extra-small px-1 mt-2" style={{ fontSize: "0.75rem" }}>
              <span>SmallShop v1.0</span>
              <span className="text-primary fw-bold">Phase F3</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
