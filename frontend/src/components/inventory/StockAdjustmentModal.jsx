import React, { useState, useEffect } from "react";
import ErrorMessage from "../common/ErrorMessage";
import Button from "../common/Button";

const StockAdjustmentModal = ({
  show = false,
  mode = "increase", // "increase" | "decrease"
  product = null,
  onConfirm,
  onClose,
}) => {
  const [quantity, setQuantity] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuantity("");
    setValidationError("");
    setError("");
  }, [product, mode, show]);

  if (!show || !product) return null;

  const currentStock = product.stockQuantity ?? product.StockQuantity ?? 0;
  const isIncrease = mode === "increase";

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    setQuantity(val);
    if (validationError) setValidationError("");
  };

  const validate = () => {
    if (!quantity || String(quantity).trim() === "") {
      setValidationError("Quantity is required.");
      return false;
    }

    const num = Number(quantity);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      setValidationError("Quantity must be a positive whole integer (greater than 0).");
      return false;
    }

    if (!isIncrease && num > currentStock) {
      setValidationError(`Cannot decrease by ${num}. Maximum available stock is ${currentStock} units.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      await onConfirm(Number(quantity));
      onClose();
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data?.message?.includes("stock")) {
        setError("Insufficient stock available.");
      } else if (err.response && err.response.status === 409) {
        setError("Stock was changed by another operation. Please refresh and try again.");
      } else {
        setError(err?.message || "Unable to update stock. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-light border-bottom py-3">
            <div className="d-flex align-items-center gap-2">
              <i
                className={`bi ${
                  isIncrease ? "bi-plus-circle-fill text-success" : "bi-dash-circle-fill text-danger"
                } fs-4`}
              ></i>
              <h5 className="modal-title fw-bold">
                {isIncrease ? "Increase Product Stock" : "Decrease Product Stock"}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body p-4">
              <ErrorMessage message={error} onDismiss={() => setError("")} />

              {/* Product Info summary box */}
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="fw-bold text-dark">{product.name}</div>
                <div className="d-flex align-items-center justify-content-between mt-1">
                  <span className="small font-monospace text-muted">SKU: {product.sku || product.SKU}</span>
                  <span className="badge bg-secondary">Current Stock: {currentStock} units</span>
                </div>
              </div>

              {/* Quantity input */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  {isIncrease ? "Stock Quantity to Add" : "Stock Quantity to Remove"} <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className={`bi ${isIncrease ? "bi-plus-lg" : "bi-dash-lg"}`}></i>
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={`form-control ${validationError ? "is-invalid" : ""}`}
                    placeholder="Enter quantity (e.g. 5)"
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={loading}
                    autoFocus
                  />
                  <span className="input-group-text bg-light">units</span>
                </div>
                {validationError && (
                  <div className="text-danger small mt-1">{validationError}</div>
                )}
                {!isIncrease && (
                  <div className="form-text extra-small mt-1 text-muted">
                    Maximum reduction allowed: <strong>{currentStock} units</strong>.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer bg-light border-top py-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant={isIncrease ? "success" : "danger"}
                loading={loading}
              >
                <i className={`bi ${isIncrease ? "bi-arrow-up-circle" : "bi-arrow-down-circle"} me-1`}></i>
                {isIncrease ? "Confirm Increase" : "Confirm Decrease"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
