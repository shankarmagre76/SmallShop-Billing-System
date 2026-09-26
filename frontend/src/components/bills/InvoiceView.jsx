import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { downloadBillPDF } from "../../utils/pdfGenerator";
import { shareBillPDFOnWhatsApp } from "../../utils/whatsappPdfSharing";
import { SHOP_NAME, SHOP_SUBTITLE, SHOP_FOOTER_MESSAGE } from "../../constants/config";
import { ROUTES } from "../../constants/routes";

const InvoiceView = ({ bill }) => {
  const [shareStatus, setShareStatus] = useState({ message: "", type: "info" });
  const [sharing, setSharing] = useState(false);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

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
          message: "Share sheet opened. Select WhatsApp to send the PDF invoice.",
          type: "success",
        });
      } else if (result.method === "download-fallback") {
        setShareStatus({
          message:
            "PDF file sharing is not supported by this browser. Downloaded PDF — please attach it manually in WhatsApp.",
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
    <div className="container-fluid p-0">
      {/* Share Status Alert Banner (hidden when printing) */}
      {shareStatus.message && (
        <div
          className={`alert alert-${shareStatus.type} alert-dismissible fade show text-start small mb-3 py-2 px-3 no-print`}
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

      {/* Top Action Bar (hidden when printing) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 no-print">
        <Link to={ROUTES.BILLS} className="btn btn-outline-secondary d-flex align-items-center gap-2">
          <i className="bi bi-arrow-left"></i>
          <span>Back to Bills</span>
        </Link>

        <div className="d-flex flex-wrap gap-2">
          <Link to={ROUTES.BILLING} className="btn btn-outline-primary d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            <span>Create New Bill</span>
          </Link>
          <button
            type="button"
            className="btn btn-outline-danger d-flex align-items-center gap-2 px-3 fw-semibold"
            onClick={handleDownloadPDF}
            title="Download PDF invoice"
          >
            <i className="bi bi-file-earmark-pdf"></i>
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            className="btn btn-success d-flex align-items-center gap-2 px-3 fw-semibold"
            onClick={handleWhatsAppShare}
            disabled={sharing}
            title="Share PDF invoice on WhatsApp"
          >
            {sharing ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="bi bi-whatsapp"></i>
            )}
            <span>Send on WhatsApp</span>
          </button>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 px-3"
            onClick={handlePrint}
          >
            <i className="bi bi-printer-fill"></i>
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 printable-invoice bg-white">
        {/* Invoice Header */}
        <div className="row g-3 align-items-start justify-content-between mb-4 pb-4 border-bottom">
          <div className="col-12 col-md-7">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shop text-primary fs-2"></i>
              <h3 className="fw-bold mb-0 text-dark">{SHOP_NAME}</h3>
            </div>
            <p className="text-muted small mb-0">{SHOP_SUBTITLE}</p>
          </div>

          <div className="col-12 col-md-5 text-md-end">
            <h4 className="fw-bold text-uppercase text-primary mb-1">Tax Invoice</h4>
            <div className="fs-5 fw-bold font-monospace text-dark">
              {bill.billNumber || `BILL-#${bill.id}`}
            </div>
            <div className="small text-muted mt-1">
              <strong>Invoice Date:</strong> {formatDate(bill.createdAt)}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-3 bg-light rounded-3 mb-4 border">
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <div className="extra-small text-muted text-uppercase fw-bold">Customer Information</div>
              <div className="fs-6 fw-bold text-dark mt-1">
                {bill.customerName || "Walk-in Customer"}
              </div>
            </div>
            <div className="col-12 col-sm-6 text-sm-end">
              <div className="extra-small text-muted text-uppercase fw-bold">Payment Status</div>
              <span className="badge bg-success px-3 py-2 mt-1">Paid / Completed</span>
            </div>
          </div>
        </div>

        {/* Bill Items Table */}
        <div className="table-responsive mb-4">
          <table className="table table-bordered align-middle">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th scope="col" style={{ width: "40%" }}>Product Item</th>
                <th scope="col" className="text-center">Qty</th>
                <th scope="col" className="text-end">Historical Unit Price</th>
                <th scope="col" className="text-end">Tax Rate</th>
                <th scope="col" className="text-end">Line Tax</th>
                <th scope="col" className="text-end">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items || []).map((item, index) => (
                <tr key={item.productId || index}>
                  <td>
                    <div className="fw-bold text-dark">{item.productName}</div>
                    <div className="small font-monospace text-muted">SKU: {item.sku || item.SKU}</div>
                  </td>
                  <td className="text-center fw-semibold">{item.quantity}</td>
                  <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-end">{item.taxRate}%</td>
                  <td className="text-end">{formatCurrency(item.taxAmount)}</td>
                  <td className="text-end fw-bold text-dark">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stored Authoritative Totals Breakdown */}
        <div className="row justify-content-end">
          <div className="col-12 col-md-5">
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Subtotal</span>
                <span className="fw-semibold text-dark">{formatCurrency(bill.subTotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">GST Tax Amount</span>
                <span className="fw-semibold text-dark">{formatCurrency(bill.taxAmount)}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between pt-1">
                <span className="fw-bold fs-6">Grand Total</span>
                <span className="fw-bold fs-5 text-primary">{formatCurrency(bill.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="mt-5 pt-4 border-top text-center text-muted extra-small">
          <p className="mb-0">{SHOP_FOOTER_MESSAGE} Computer generated tax invoice for {SHOP_NAME}.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
