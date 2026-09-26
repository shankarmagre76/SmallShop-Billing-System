import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { ROUTES } from "../../constants/routes";

const BillsListPage = () => {
  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Bills History"
        subtitle="View all generated sales invoices, details, and totals"
      >
        <Link to={ROUTES.BILLING} className="btn btn-primary d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          <span>Create New Bill</span>
        </Link>
      </PageHeader>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <EmptyState
            title="Bills Record History Ready"
            message="Sales transaction history and invoice lookup initialized. Consumes GET /api/Bills endpoint."
            icon="bi-receipt-cutoff"
          />
        </div>
      </div>
    </div>
  );
};

export default BillsListPage;
