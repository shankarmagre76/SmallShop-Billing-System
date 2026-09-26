import React from "react";

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pb-2 border-bottom">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
      </div>
      {actionButton && <div className="mt-3 mt-md-0">{actionButton}</div>}
    </div>
  );
};

export default PageHeader;
