import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SHOP_NAME, SHOP_SUBTITLE, SHOP_FOOTER_MESSAGE } from "../constants/config.js";
import { formatDate } from "./formatters.js";

/**
 * Formats numeric currency values for jsPDF text rendering using Rs prefix.
 * Standard Helvetica font in jsPDF uses WinAnsi encoding which does not render Unicode Rupee symbol (₹).
 * @param {number|string} amount
 * @returns {string} Formatted currency string (e.g. "Rs. 1,000.00")
 */
const formatPdfCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "Rs. 0.00";
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Creates and formats a professional jsPDF document for a given bill object.
 * @param {Object} bill - Authoritative backend bill response object
 * @returns {jsPDF} Generated jsPDF document
 */
export const createBillPDFDoc = (bill) => {
  if (!bill) {
    throw new Error("Bill data is required to generate PDF invoice.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const billNo = bill.billNumber || `BILL-${bill.id || "000"}`;
  const dateStr = formatDate(bill.createdAt, true);
  const customerName = bill.customerName || "Walk-in Customer";

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // #0f172a Dark Slate
  doc.rect(0, 0, 210, 28, "F");

  // Shop Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(SHOP_NAME.toUpperCase(), 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(SHOP_SUBTITLE, 14, 22);

  // Invoice Title Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAX INVOICE", 196, 15, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${billNo}`, 196, 22, { align: "right" });

  // Customer & Bill Details Card
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER & BILL DETAILS", 14, 38);
  doc.setFont("helvetica", "normal");
  doc.text(`Customer Name: ${customerName}`, 14, 44);
  doc.text(`Invoice Date: ${dateStr}`, 14, 50);

  // Items Table Header & Body
  const tableHead = [["#", "Item Description", "Qty", "Unit Price", "Tax Rate", "Line Total"]];
  const tableBody = (bill.items || []).map((item, index) => [
    index + 1,
    item.productName || "Product Item",
    item.quantity,
    formatPdfCurrency(item.unitPrice),
    `${item.taxRate || 0}%`,
    formatPdfCurrency(item.lineTotal),
  ]);

  autoTable(doc, {
    startY: 56,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 35, halign: "right" },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 120;

  // Authoritative Totals Summary Box (Right Aligned)
  const totalBoxWidth = 80;
  const startX = 210 - 14 - totalBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(startX, finalY, totalBoxWidth, 34, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  doc.text("Subtotal:", startX + 4, finalY + 8);
  doc.text(formatPdfCurrency(bill.subTotal), 196 - 4, finalY + 8, { align: "right" });

  doc.text("GST Tax Amount:", startX + 4, finalY + 15);
  doc.text(formatPdfCurrency(bill.taxAmount), 196 - 4, finalY + 15, { align: "right" });

  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225);
  doc.line(startX + 4, finalY + 19, 196 - 4, finalY + 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL AMOUNT:", startX + 4, finalY + 27);
  doc.text(formatPdfCurrency(bill.totalAmount), 196 - 4, finalY + 27, { align: "right" });

  // Page Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${SHOP_FOOTER_MESSAGE} Computer generated tax invoice for ${SHOP_NAME}.`,
    105,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
};

/**
 * Returns standardized filename for bill PDF.
 * Example: "Bill_BILL-000123.pdf"
 * @param {Object} bill
 * @returns {string} Filename string
 */
export const getBillPDFFilename = (bill) => {
  const rawNo = bill?.billNumber || `BILL-${bill?.id || "000"}`;
  const cleanNo = String(rawNo).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `Bill_${cleanNo}.pdf`;
};

/**
 * Triggers browser file download of PDF invoice.
 * @param {Object} bill
 */
export const downloadBillPDF = (bill) => {
  const doc = createBillPDFDoc(bill);
  const filename = getBillPDFFilename(bill);
  doc.save(filename);
};

/**
 * Generates PDF Blob and metadata object for Web Share API / native device sharing.
 * @param {Object} bill
 * @returns {{ blob: Blob, filename: string, pdfDoc: jsPDF }}
 */
export const generateBillPDFBlob = (bill) => {
  const doc = createBillPDFDoc(bill);
  const blob = doc.output("blob");
  const filename = getBillPDFFilename(bill);
  return { blob, filename, pdfDoc: doc };
};
