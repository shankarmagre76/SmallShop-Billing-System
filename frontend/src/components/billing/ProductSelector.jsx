import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatStock } from "../../utils/formatters";
import * as productService from "../../services/productService";
import LoadingSpinner from "../common/LoadingSpinner";

const ProductSelector = ({ onAddToCart, cartProductIds = [] }) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (searchTerm.trim()) {
        res = await productService.searchProducts(searchTerm.trim(), 1, 10);
      } else {
        res = await productService.getProducts(1, 10);
      }
      // Filter active products only
      const activeProducts = (res.items || []).filter((p) => p.isActive !== false);
      setProducts(activeProducts);
    } catch {
      setError("Unable to load products for selection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchProducts]);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-bottom py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-box-seam text-primary fs-5"></i>
          <h6 className="fw-bold mb-0">Select Products for Bill</h6>
        </div>
      </div>

      <div className="card-body p-3">
        {/* Search input */}
        <div className="input-group mb-3">
          <span className="input-group-text bg-light text-muted border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search by product name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="btn btn-outline-secondary bg-light border-start-0"
              type="button"
              onClick={() => setQuery("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* Product Results List */}
        {loading ? (
          <div className="py-4">
            <LoadingSpinner size="sm" message="Loading selectable products..." />
          </div>
        ) : error ? (
          <div className="alert alert-warning small p-2 text-center">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            <i className="bi bi-box fs-3 d-block mb-1"></i>
            No active products found matching "{query}".
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "380px", overflowY: "auto" }}>
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="table-light text-muted extra-small text-uppercase">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stockQty = p.stockQuantity ?? p.StockQuantity ?? 0;
                  const isOut = stockQty <= 0;
                  const inCart = cartProductIds.includes(p.id);

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="fw-semibold text-dark small">{p.name}</div>
                        <div className="extra-small font-monospace text-muted">{p.sku || p.SKU}</div>
                      </td>
                      <td>
                        <div className="small fw-bold text-primary">{formatCurrency(p.price)}</div>
                        <div className="extra-small text-muted">{p.taxRate || p.TaxRate || 0}% Tax</div>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="badge bg-danger bg-opacity-10 text-danger extra-small">Out of stock</span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success extra-small">
                            {formatStock(stockQty)}
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className={`btn btn-sm ${inCart ? "btn-outline-success" : "btn-primary"} py-1 px-2`}
                          onClick={() => onAddToCart(p)}
                          disabled={isOut}
                        >
                          <i className={`bi ${inCart ? "bi-plus" : "bi-cart-plus"} me-1`}></i>
                          {inCart ? "Add More" : "Add"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
