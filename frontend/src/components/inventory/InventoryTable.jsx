import React from "react";
import { formatCurrency, formatStock } from "../../utils/formatters";
import StockStatusBadge from "./StockStatusBadge";
import EmptyState from "../common/EmptyState";

const InventoryTable = ({
  products = [],
  isAdmin = false,
  onViewProduct,
  onOpenIncreaseModal,
  onOpenDecreaseModal,
}) => {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No inventory records found."
        message="No stock items matched your search query or filter criteria."
        icon="bi-clipboard-data"
      />
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-muted small text-uppercase">
          <tr>
            <th scope="col" className="ps-3">Product / SKU</th>
            <th scope="col">Price</th>
            <th scope="col">Tax Rate</th>
            <th scope="col">Current Stock</th>
            <th scope="col">Stock Status</th>
            <th scope="col" className="text-end pe-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stockQty = p.stockQuantity ?? p.StockQuantity ?? 0;

            return (
              <tr key={p.id}>
                <td className="ps-3">
                  <div className="fw-bold text-dark">{p.name}</div>
                  <div className="small font-monospace text-muted">SKU: {p.sku || p.SKU}</div>
                </td>
                <td>
                  <span className="fw-semibold text-primary">{formatCurrency(p.price)}</span>
                </td>
                <td>
                  <span className="badge bg-light text-dark border">{p.taxRate || p.TaxRate || 0}%</span>
                </td>
                <td>
                  <span className="fw-bold">{formatStock(stockQty)}</span>
                </td>
                <td>
                  <StockStatusBadge stockQuantity={stockQty} threshold={5} />
                </td>
                <td className="text-end pe-3">
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => onViewProduct(p)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                      <span className="d-none d-md-inline ms-1">View</span>
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => onOpenIncreaseModal(p)}
                          title="Increase Stock"
                        >
                          <i className="bi bi-plus-lg"></i>
                          <span className="d-none d-md-inline ms-1">+ Stock</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => onOpenDecreaseModal(p)}
                          disabled={stockQty <= 0}
                          title="Decrease Stock"
                        >
                          <i className="bi bi-dash-lg"></i>
                          <span className="d-none d-md-inline ms-1">- Stock</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
