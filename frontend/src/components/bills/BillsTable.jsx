import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { downloadBillPDF } from "../../utils/pdfGenerator";
import { shareBillPDFOnWhatsApp } from "../../utils/whatsappPdfSharing";
import EmptyState from "../common/EmptyState";
import { ROUTES } from "../../constants/routes";

const BillsTable = ({ bills = [], onAddNewBill }) => {
  if (!bills || bills.length === 0) {
    return (
      <EmptyState
        title="No bills found."
        message="Create your first bill to see it listed here."
        icon="bi-receipt-cutoff"
        actionLabel="+ Create New Bill"
        onAction={onAddNewBill}
      />
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-muted small text-uppercase">
          <tr>
            <th scope="col" className="ps-3">Bill Number</th>
            <th scope="col">Customer Name</th>
            <th scope="col">Bill Date</th>
            <th scope="col">Subtotal</th>
            <th scope="col">Tax (GST)</th>
            <th scope="col">Grand Total</th>
            <th scope="col" className="text-end pe-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td className="ps-3">
                <Link
                  to={`/bills/${bill.id}`}
                  className="fw-bold font-monospace text-primary text-decoration-none"
                >
                  {bill.billNumber || `BILL-#${bill.id}`}
                </Link>
              </td>
              <td>
                <span className="fw-semibold text-dark">
                  {bill.customerName || "Walk-in Customer"}
                </span>
              </td>
              <td>
                <span className="small text-muted">{formatDate(bill.createdAt)}</span>
              </td>
              <td>
                <span className="small text-muted">{formatCurrency(bill.subTotal)}</span>
              </td>
              <td>
                <span className="small text-muted">{formatCurrency(bill.taxAmount)}</span>
              </td>
              <td>
                <span className="fw-bold text-dark">{formatCurrency(bill.totalAmount)}</span>
              </td>
              <td className="text-end pe-3">
                <div className="d-flex align-items-center justify-content-end gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm px-2"
                    onClick={() => downloadBillPDF(bill)}
                    title="Download Invoice PDF"
                    aria-label="Download Invoice PDF"
                  >
                    <i className="bi bi-file-earmark-pdf"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm px-2"
                    onClick={() => shareBillPDFOnWhatsApp(bill)}
                    title="Send PDF Invoice via WhatsApp"
                    aria-label="Send PDF Invoice via WhatsApp"
                  >
                    <i className="bi bi-whatsapp"></i>
                  </button>
                  <Link
                    to={`/bills/${bill.id}`}
                    className="btn btn-outline-primary btn-sm px-3"
                    title="View Invoice Details"
                  >
                    <i className="bi bi-eye me-1"></i>
                    <span>View</span>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillsTable;
