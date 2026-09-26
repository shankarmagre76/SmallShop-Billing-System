import React, { useState, useEffect } from "react";

const ProductFilters = ({ onSearchChange, onStatusFilterChange, initialSearch = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body py-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-7 col-lg-8">
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary bg-light border-start-0"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-5 col-lg-4 d-flex align-items-center gap-2">
            <label className="form-label small fw-semibold text-muted text-nowrap mb-0">
              Filter Status:
            </label>
            <select
              className="form-select form-select-sm"
              onChange={(e) => onStatusFilterChange(e.target.value)}
              defaultValue="all"
            >
              <option value="all">All Products</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
