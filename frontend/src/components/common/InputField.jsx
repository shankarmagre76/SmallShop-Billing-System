import React from "react";

const InputField = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  helpText = "",
  min,
  max,
  step,
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id || name} className="form-label fw-semibold small">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      {helpText && !error && <div className="form-text small">{helpText}</div>}
      {error && <div className="invalid-feedback small">{error}</div>}
    </div>
  );
};

export default InputField;
