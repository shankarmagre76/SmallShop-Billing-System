import React from "react";
import { formatCurrency, formatDate, formatStock } from "../../utils/formatters";

const ProductDetails = ({ product, show, onClose, onEdit }) => {
  if (!show || !product) return null;

  return (
    <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-light border-bottom py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-box-seam text-primary fs-4"></i>
              <h5 className="modal-title fw-bold">Product Details</h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
              <div>
                <h4 className="fw-bold mb-1">{product.name}</h4>
                <span className="badge bg-secondary font-monospace">SKU: {product.sku || product.SKU}</span>
              </div>
              <div>
                {product.isActive ? (
                  <span className="badge bg-success px-3 py-2 fs-6">Active</span>
                ) : (
                  <span className="badge bg-danger px-3 py-2 fs-6">Inactive</span>
                )}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small fw-semibold">Unit Price</div>
                  <div className="fs-5 fw-bold text-primary">{formatCurrency(product.price)}</div>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small fw-semibold">Tax Rate</div>
                  <div className="fs-5 fw-bold text-dark">{product.taxRate || product.TaxRate || 0}%</div>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small fw-semibold">Stock Level</div>
                  <div className="fs-6 fw-bold mt-1">
                    {product.stockQuantity === 0 || product.StockQuantity === 0 ? (
                      <span className="badge bg-danger text-wrap">0 units (Out of stock)</span>
                    ) : (
                      <span className="badge bg-success text-wrap">{formatStock(product.stockQuantity ?? product.StockQuantity)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small fw-semibold">System ID</div>
                  <div className="fs-6 fw-semibold text-muted">#{product.id}</div>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small fw-semibold mb-1">Description</div>
                  <div className="text-dark small">
                    {product.description || <em className="text-muted">No description provided.</em>}
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="small text-muted">
                  <strong>Created:</strong> {formatDate(product.createdAt || product.CreatedAt)}
                </div>
              </div>

              <div className="col-6">
                <div className="small text-muted">
                  <strong>Updated:</strong> {formatDate(product.updatedAt || product.UpdatedAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-top py-2">
            {onEdit && (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
              >
                <i className="bi bi-pencil me-1"></i> Edit Product
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
