import React, { useEffect } from "react";

const ToastNotification = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgClasses = {
    success: "bg-success text-white",
    danger: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-info text-white",
  };

  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-exclamation-triangle-fill",
    warning: "bi-exclamation-circle-fill",
    info: "bi-info-circle-fill",
  };

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1080 }}
    >
      <div
        className={`toast show align-items-center ${bgClasses[type] || bgClasses.success} border-0 shadow-lg rounded-3`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex p-2">
          <div className="toast-body d-flex align-items-center gap-2">
            <i className={`bi ${icons[type] || icons.success} fs-5`}></i>
            <span className="fw-medium">{message}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
