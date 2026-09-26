import React from "react";
import EmptyState from "../common/EmptyState";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import { formatCurrency } from "../../utils/formatters";

const RecentActivity = ({ activities = [], loading = false, error = null, onRetry }) => {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-bottom fw-bold py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-primary"></i>
          <span>Recent Activity</span>
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="py-4">
            <LoadingSpinner message="Fetching recent transactions..." />
          </div>
        ) : error ? (
          <div className="p-3">
            <ErrorMessage message={error} />
            {onRetry && (
              <button onClick={onRetry} className="btn btn-outline-primary btn-sm mt-2">
                <i className="bi bi-arrow-clockwise me-1"></i> Retry
              </button>
            )}
          </div>
        ) : activities.length > 0 ? (
          <div className="list-group list-group-flush">
            {activities.map((act, index) => (
              <div key={act.id || index} className="list-group-item px-3 py-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold small">{act.title || `Bill #${act.id}`}</div>
                  <div className="text-muted extra-small">{act.subtitle || act.createdAt || "Just now"}</div>
                </div>
                <div className="fw-bold text-success">{act.amount ? formatCurrency(act.amount) : ""}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recent activity yet."
            message="Newly created sales invoices and inventory updates will appear here."
            icon="bi-receipt"
          />
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
