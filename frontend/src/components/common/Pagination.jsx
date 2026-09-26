import React from "react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalCount <= pageSize) {
    if (totalCount === 0) return null;
    return (
      <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top bg-light rounded-bottom">
        <span className="small text-muted">
          Showing 1–{totalCount} of {totalCount} items
        </span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-top bg-light rounded-bottom">
      <div className="small text-muted">
        Showing <span className="fw-semibold">{totalCount > 0 ? startItem : 0}</span>–
        <span className="fw-semibold">{endItem}</span> of{" "}
        <span className="fw-semibold">{totalCount}</span> items
      </div>

      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
          <button
            className="page-item-link page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            Previous
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
