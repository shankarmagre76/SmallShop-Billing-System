import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  icon = null,
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size ? `btn-${size}` : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Processing...
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon} me-2`}></i>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
