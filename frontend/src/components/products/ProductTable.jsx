import React, { useState } from "react";
import { formatCurrency, formatStock } from "../../utils/formatters";
import ConfirmModal from "../common/ConfirmModal";
import EmptyState from "../common/EmptyState";

const ProductTable = ({
  products = [],
  isAdmin = false,
  onViewProduct,
  onEditProduct,
  onDeactivateProduct,
  onAddNewProduct,
}) => {
  const [productToDeactivate, setProductToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const confirmDeactivate = async () => {
    if (!productToDeactivate) return;
    setDeactivating(true);
    await onDeactivateProduct(productToDeactivate.id);
    setDeactivating(false);
    setProductToDeactivate(null);
  };

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found."
        message="No products matched your criteria or inventory is currently empty."
        icon="bi-box-seam"
        actionLabel={isAdmin ? "+ Add New Product" : null}
        onAction={onAddNewProduct}
      />
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-muted small text-uppercase">
            <tr>
              <th scope="col" className="ps-3">Product Item</th>
              <th scope="col">Price</th>
              <th scope="col">Tax Rate</th>
              <th scope="col">Stock Level</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stockQty = p.stockQuantity ?? p.StockQuantity ?? 0;
              const isOut = stockQty <= 0;

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
                    {isOut ? (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">
                        Out of Stock (0)
                      </span>
                    ) : (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                        {formatStock(stockQty)}
                      </span>
                    )}
                  </td>
                  <td>
                    {p.isActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
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
                            className="btn btn-outline-primary"
                            onClick={() => onEditProduct(p)}
                            title="Edit Product"
                          >
                            <i className="bi bi-pencil"></i>
                            <span className="d-none d-md-inline ms-1">Edit</span>
                          </button>

                          {p.isActive && (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => setProductToDeactivate(p)}
                              title="Deactivate Product"
                            >
                              <i className="bi bi-slash-circle"></i>
                              <span className="d-none d-md-inline ms-1">Deactivate</span>
                            </button>
                          )}
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

      {/* Deactivation Confirmation Modal */}
      <ConfirmModal
        show={!!productToDeactivate}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${productToDeactivate?.name}"? Deactivated products will no longer be available for new bills.`}
        confirmText="Deactivate Product"
        confirmVariant="danger"
        loading={deactivating}
        onConfirm={confirmDeactivate}
        onClose={() => setProductToDeactivate(null)}
      />
    </>
  );
};

export default ProductTable;
