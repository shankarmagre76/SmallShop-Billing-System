import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import { getErrorMessage } from "../../utils/errorHandler";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="card shadow border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle d-inline-block mb-3">
            <i className="bi bi-person-plus fs-1"></i>
          </div>
          <h3 className="fw-bold mb-1">Create Staff Account</h3>
          <p className="text-muted small">Register as shop staff member to manage bills and stock</p>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError("")} />

        {successMessage && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                name="fullName"
                className={`form-control border-start-0 ps-0 ${validationErrors.fullName ? "is-invalid" : ""}`}
                placeholder="Shankar Magre"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {validationErrors.fullName && (
              <div className="text-danger small mt-1">{validationErrors.fullName}</div>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                className={`form-control border-start-0 ps-0 ${validationErrors.email ? "is-invalid" : ""}`}
                placeholder="staff@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {validationErrors.email && (
              <div className="text-danger small mt-1">{validationErrors.email}</div>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control border-start-0 border-end-0 ps-0 ${
                  validationErrors.password ? "is-invalid" : ""
                }`}
                placeholder="At least 8 characters (with uppercase, digit, symbol)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary bg-light border-start-0"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
            {validationErrors.password && (
              <div className="text-danger small mt-1">{validationErrors.password}</div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="form-label fw-semibold small">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-control border-start-0 border-end-0 ps-0 ${
                  validationErrors.confirmPassword ? "is-invalid" : ""
                }`}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary bg-light border-start-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <div className="text-danger small mt-1">{validationErrors.confirmPassword}</div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" className="w-100 py-2 fw-semibold" loading={loading}>
            <i className="bi bi-person-check me-2"></i>
            Register Staff Account
          </Button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="small text-muted mb-0">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="fw-semibold text-primary text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
