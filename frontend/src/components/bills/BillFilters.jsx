import React, { useState, useEffect } from "react";

const BillFilters = ({ onSearchChange, onDateFilterChange, initialSearch = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  const handleDateChange = (e) => {
    const dateVal = e.target.value;
    setSelectedDate(dateVal);
    if (onDateFilterChange) {
      onDateFilterChange(dateVal);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedDate("");
    if (onDateFilterChange) onDateFilterChange("");
  };

  return (
    <div className="card border-0 shadow-sm mb-4 no-print">
      <div className="card-body py-3">
        <div className="row g-3 align-items-center">
          {/* Search by Bill Number or Customer Name */}
          <div className="col-12 col-md-7 col-lg-8">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Filter by bill number (e.g. INV-2026-000001) or customer name..."
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

          {/* Date Filter */}
          <div className="col-12 col-md-5 col-lg-4 d-flex align-items-center gap-2">
            <label className="form-label small fw-semibold text-muted text-nowrap mb-0">
              Bill Date:
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={selectedDate}
              onChange={handleDateChange}
            />
            {(searchTerm || selectedDate) && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm text-nowrap"
                onClick={handleClear}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillFilters;
