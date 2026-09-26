import React, { useState, useEffect } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

const ProductForm = ({ show, mode = "create", product = null, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    stockQuantity: "0",
    taxRate: "18",
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name || "",
        sku: product.sku || product.SKU || "",
        description: product.description || "",
        price: product.price !== undefined ? String(product.price) : "0",
        stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : "0",
        taxRate: product.taxRate !== undefined ? String(product.taxRate) : "18",
        isActive: product.isActive !== undefined ? Boolean(product.isActive) : true,
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        description: "",
        price: "",
        stockQuantity: "0",
        taxRate: "18",
        isActive: true,
      });
    }
    setValidationErrors({});
    setError("");
  }, [product, mode, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required.";
    }

    if (mode === "create" && !formData.sku.trim()) {
      errors.sku = "SKU is required.";
    }

    if (formData.price === "" || isNaN(formData.price) || Number(formData.price) < 0) {
      errors.price = "Price must be a valid number greater than or equal to 0.";
    }

    if (mode === "create" && (formData.stockQuantity === "" || isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0)) {
      errors.stockQuantity = "Stock quantity must be a non-negative integer.";
    }

    if (formData.taxRate === "" || isNaN(formData.taxRate) || Number(formData.taxRate) < 0 || Number(formData.taxRate) > 100) {
      errors.taxRate = "Tax rate must be a percentage between 0 and 100.";
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
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save product. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-light border-bottom py-3">
            <div className="d-flex align-items-center gap-2">
              <i className={`bi ${isEdit ? "bi-pencil-square" : "bi-plus-circle"} text-primary fs-4`}></i>
              <h5 className="modal-title fw-bold">
                {isEdit ? `Edit Product - ${product?.name}` : "Add New Product"}
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

              <div className="row g-3">
                {/* Product Name */}
                <div className="col-12 col-md-8">
                  <label className="form-label fw-semibold small">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${validationErrors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Executive Leather Bag"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback">{validationErrors.name}</div>
                  )}
                </div>

                {/* SKU Code */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold small">
                    SKU Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    className={`form-control font-monospace ${validationErrors.sku ? "is-invalid" : ""}`}
                    placeholder="e.g. BAG-001"
                    value={formData.sku}
                    onChange={handleChange}
                    disabled={loading || isEdit}
                  />
                  {isEdit && (
                    <div className="form-text extra-small">SKU is immutable after product creation.</div>
                  )}
                  {validationErrors.sku && (
                    <div className="invalid-feedback">{validationErrors.sku}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-semibold small">Description</label>
                  <textarea
                    name="description"
                    rows="2"
                    className="form-control"
                    placeholder="Optional details, dimensions, specs..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                  ></textarea>
                </div>

                {/* Unit Price */}
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-semibold small">
                    Unit Price (₹) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      className={`form-control ${validationErrors.price ? "is-invalid" : ""}`}
                      placeholder="1000.00"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {validationErrors.price && (
                    <div className="text-danger small mt-1">{validationErrors.price}</div>
                  )}
                </div>

                {/* Stock Quantity */}
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-semibold small">
                    Initial Stock <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="stockQuantity"
                    className={`form-control ${validationErrors.stockQuantity ? "is-invalid" : ""}`}
                    placeholder="25"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    disabled={loading || isEdit}
                  />
                  {isEdit && (
                    <div className="form-text extra-small">Use Inventory tab to adjust stock quantity.</div>
                  )}
                  {validationErrors.stockQuantity && (
                    <div className="invalid-feedback">{validationErrors.stockQuantity}</div>
                  )}
                </div>

                {/* Tax Rate */}
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-semibold small">
                    Tax Rate (%) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="taxRate"
                      className={`form-control ${validationErrors.taxRate ? "is-invalid" : ""}`}
                      placeholder="18"
                      value={formData.taxRate}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="input-group-text bg-light">%</span>
                  </div>
                  {validationErrors.taxRate && (
                    <div className="text-danger small mt-1">{validationErrors.taxRate}</div>
                  )}
                </div>

                {/* Is Active toggle (Edit mode) */}
                {isEdit && (
                  <div className="col-12 mt-3">
                    <div className="form-check form-switch p-3 bg-light rounded-3">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="checkbox"
                        role="switch"
                        id="isActiveSwitch"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label fw-semibold small" htmlFor="isActiveSwitch">
                        Active Status (Check to enable product for billing)
                      </label>
                    </div>
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
                variant="primary"
                loading={loading}
              >
                <i className="bi bi-check2-circle me-1"></i>
                {isEdit ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
