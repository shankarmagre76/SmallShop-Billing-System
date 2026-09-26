import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import { getErrorMessage } from "../../utils/errorHandler";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="card shadow border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: "440px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle d-inline-block mb-3">
            <i className="bi bi-shop fs-1"></i>
          </div>
          <h3 className="fw-bold mb-1">Welcome Back</h3>
          <p className="text-muted small">Sign in to Small Shop Inventory & Billing System</p>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError("")} />

        <form onSubmit={handleSubmit} noValidate>
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
              {validationErrors.email && (
                <div className="invalid-feedback d-block">{validationErrors.email}</div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
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
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary bg-light border-start-0"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
            {validationErrors.password && (
              <div className="text-danger small mt-1">{validationErrors.password}</div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" className="w-100 py-2 fw-semibold" loading={loading}>
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Sign In
          </Button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="small text-muted mb-0">
            Don't have an account?{" "}
            <Link to={ROUTES.REGISTER} className="fw-semibold text-primary text-decoration-none">
              Register Staff Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
