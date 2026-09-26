import React from "react";
import { formatCurrency } from "../../utils/formatters";
import {
  calculateLineSubtotal,
  calculateLineTax,
  calculateLineTotal,
} from "../../utils/billingCalculations";

const BillCartItem = ({ item, onQuantityChange, onRemove }) => {
  const stockQty = item.stockQuantity ?? item.maxStock ?? 999;
  const isAtMaxStock = item.quantity >= stockQty;

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const clamped = Math.max(1, Math.min(val, stockQty));
    onQuantityChange(item.productId, clamped);
  };

  const lineSubtotal = calculateLineSubtotal(item.price, item.quantity);
  const lineTax = calculateLineTax(item.price, item.quantity, item.taxRate);
  const lineTotal = calculateLineTotal(item.price, item.quantity, item.taxRate);

  return (
    <div className="p-3 border rounded-3 mb-2 bg-white shadow-sm">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div>
          <h6 className="fw-bold mb-0 text-dark">{item.name}</h6>
          <span className="extra-small font-monospace text-muted">SKU: {item.sku}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm p-1 border-0"
          onClick={() => onRemove(item.productId)}
          title="Remove Item"
        >
          <i className="bi bi-trash fs-6"></i>
        </button>
      </div>

      <div className="row g-2 align-items-center">
        {/* Unit Price & Tax Info */}
        <div className="col-12 col-sm-4">
          <div className="extra-small text-muted">Unit Price:</div>
          <div className="small fw-semibold">{formatCurrency(item.price)}</div>
          <div className="extra-small text-muted">{item.taxRate}% GST</div>
        </div>

        {/* Quantity Controls [-] [qty] [+] */}
        <div className="col-12 col-sm-4">
          <div className="extra-small text-muted mb-1">Quantity:</div>
          <div className="input-group input-group-sm" style={{ maxWidth: "120px" }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <i className="bi bi-dash"></i>
            </button>
            <input
              type="number"
              className="form-control text-center px-1"
              value={item.quantity}
              onChange={handleInputChange}
              min="1"
              max={stockQty}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              disabled={isAtMaxStock}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
          {isAtMaxStock && (
            <div className="extra-small text-warning mt-1">Max stock ({stockQty})</div>
          )}
        </div>

        {/* Line Total */}
        <div className="col-12 col-sm-4 text-sm-end">
          <div className="extra-small text-muted">Line Total:</div>
          <div className="fw-bold text-primary">{formatCurrency(lineTotal)}</div>
          <div className="extra-small text-muted">
            (Sub: {formatCurrency(lineSubtotal)} + Tax: {formatCurrency(lineTax)})
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCartItem;
