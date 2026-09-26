import React from "react";

const EmptyState = ({
  icon = "bi-inbox",
  title = "No Data Found",
  message = "There are no records to display at this time.",
  actionButton,
}) => {
  return (
    <div className="text-center p-5 bg-white rounded shadow-sm my-3 border">
      <i className={`bi ${icon} display-4 text-muted mb-3 d-block`}></i>
      <h5 className="fw-semibold text-secondary">{title}</h5>
      <p className="text-muted small mb-3">{message}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
