import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { downloadBillPDF } from "../../utils/pdfGenerator";
import { shareBillPDFOnWhatsApp } from "../../utils/whatsappPdfSharing";
import { SHOP_NAME } from "../../constants/config";
import { ROUTES } from "../../constants/routes";

const BillSuccess = ({ bill, onCreateAnother }) => {
  const [shareStatus, setShareStatus] = useState({ message: "", type: "info" });
  const [sharing, setSharing] = useState(false);

  if (!bill) return null;

  const handleDownloadPDF = () => {
    try {
      downloadBillPDF(bill);
      setShareStatus({
        message: "Invoice PDF downloaded successfully.",
        type: "success",
      });
    } catch {
      setShareStatus({
        message: "Unable to generate invoice PDF. Please try again.",
        type: "danger",
      });
    }
  };

  const handleWhatsAppShare = async () => {
    setSharing(true);
    setShareStatus({ message: "", type: "info" });

    try {
      const result = await shareBillPDFOnWhatsApp(bill);

      if (result.method === "web-share") {
        setShareStatus({
          message: "Share sheet opened. Select WhatsApp to send the invoice.",
          type: "success",
        });
      } else if (result.method === "download-fallback") {
        setShareStatus({
          message:
            "PDF file sharing is not supported by this browser. Downloaded the PDF — please attach it manually in WhatsApp.",
          type: "warning",
        });
      } else if (result.method === "cancelled") {
        setShareStatus({
          message: "Sharing cancelled.",
          type: "secondary",
        });
      } else {
        setShareStatus({
          message: result.message || "Unable to share PDF.",
          type: "danger",
        });
      }
    } catch {
      setShareStatus({
        message: "Unable to generate invoice PDF. Please try again.",
        type: "danger",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 max-w-lg mx-auto p-4 text-center my-4">
      <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle d-inline-block mx-auto mb-3">
        <i className="bi bi-check-circle-fill fs-1"></i>
      </div>

      <h3 className="fw-bold text-success mb-1">Bill Created Successfully!</h3>
      <p className="text-muted small mb-4">
        Stock has been automatically deducted and transaction committed.
      </p>

      {/* Bill Number Header */}
      <div className="p-3 bg-light rounded-3 mb-4 border text-center">
        <div className="extra-small text-muted text-uppercase fw-bold">{SHOP_NAME} INVOICE</div>
        <div className="fs-3 fw-bold text-primary font-monospace">{bill.billNumber || `BILL-#${bill.id}`}</div>
        <div className="extra-small text-muted mt-1">Date: {formatDate(bill.createdAt)}</div>
      </div>

      {/* Customer & Totals Breakdown */}
      <div className="card bg-white border mb-4">
        <div className="card-body p-3 text-start">
          <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
            <span className="text-muted small">Customer Name:</span>
            <span className="fw-semibold text-dark">{bill.customerName || "Walk-in Customer"}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted small">Subtotal:</span>
            <span className="fw-semibold">{formatCurrency(bill.subTotal)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted small">Tax Amount (GST):</span>
            <span className="fw-semibold">{formatCurrency(bill.taxAmount)}</span>
          </div>

          <div className="d-flex justify-content-between pt-2 border-top">
            <span className="fw-bold fs-6">Grand Total:</span>
            <span className="fw-bold fs-5 text-primary">{formatCurrency(bill.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Share Status Alert Banner */}
      {shareStatus.message && (
        <div
          className={`alert alert-${shareStatus.type} alert-dismissible fade show text-start small mb-4 py-2 px-3`}
          role="alert"
        >
          <i className="bi bi-info-circle me-2"></i>
          <span>{shareStatus.message}</span>
          <button
            type="button"
            className="btn-close py-2"
            onClick={() => setShareStatus({ message: "", type: "info" })}
            aria-label="Close alert"
          ></button>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-sm-6">
          <button
            type="button"
            className="btn btn-success w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={handleWhatsAppShare}
            disabled={sharing}
          >
            {sharing ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="bi bi-whatsapp fs-5"></i>
            )}
            <span>Send on WhatsApp</span>
          </button>
        </div>

        <div className="col-12 col-sm-6">
          <button
            type="button"
            className="btn btn-outline-danger w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={handleDownloadPDF}
          >
            <i className="bi bi-file-earmark-pdf fs-5"></i>
            <span>Download PDF</span>
          </button>
        </div>

        <div className="col-12 col-sm-6">
          <Link
            to={`/bills/${bill.id}`}
            className="btn btn-outline-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-eye fs-5"></i>
            <span>View Invoice</span>
          </Link>
        </div>

        <div className="col-12 col-sm-6">
          <button
            type="button"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={onCreateAnother}
          >
            <i className="bi bi-plus-lg fs-5"></i>
            <span>Create Another Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillSuccess;
