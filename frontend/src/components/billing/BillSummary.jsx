import React from "react";
import { formatCurrency } from "../../utils/formatters";
import {
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
} from "../../utils/billingCalculations";

const BillSummary = ({ cartItems = [], customerName = "" }) => {
  const subtotal = calculateSubtotal(cartItems);
  const tax = calculateTax(cartItems);
  const grandTotal = calculateGrandTotal(cartItems);

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header bg-white border-bottom py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calculator text-success fs-5"></i>
          <h6 className="fw-bold mb-0">Invoice Summary & Preview</h6>
        </div>
      </div>

      <div className="card-body">
        {customerName && (
          <div className="p-2 bg-light rounded-2 mb-3 d-flex align-items-center justify-content-between">
            <span className="small text-muted">Customer:</span>
            <span className="fw-bold text-dark">{customerName}</span>
          </div>
        )}

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted small">Subtotal ({cartItems.length} items)</span>
          <span className="fw-semibold text-dark">{formatCurrency(subtotal)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted small">Total Tax (GST)</span>
          <span className="fw-semibold text-dark">{formatCurrency(tax)}</span>
        </div>

        <hr className="my-2" />

        <div className="d-flex justify-content-between mb-1">
          <span className="fw-bold fs-6">Grand Total</span>
          <span className="fw-bold fs-5 text-primary">{formatCurrency(grandTotal)}</span>
        </div>

        <div className="extra-small text-muted text-end">
          Authoritative calculations & stock deduction confirmed on checkout
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
