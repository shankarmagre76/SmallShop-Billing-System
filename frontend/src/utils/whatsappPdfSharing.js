import { generateBillPDFBlob, downloadBillPDF } from "./pdfGenerator.js";
import { SHOP_NAME } from "../constants/config.js";
import { formatCurrency } from "./formatters.js";

/**
 * Shares the actual PDF invoice file via device native Web Share API (WhatsApp/Share Sheet),
 * or provides a clear desktop fallback with PDF download.
 *
 * @param {Object} bill - Backend bill response object
 * @returns {Promise<{ success: boolean, method: string, message: string }>}
 */
export const shareBillPDFOnWhatsApp = async (bill) => {
  if (!bill) {
    return {
      success: false,
      method: "error",
      message: "Unable to generate invoice. Missing bill data.",
    };
  }

  const billNo = bill.billNumber || `BILL-${bill.id || "000"}`;
  const totalAmount = formatCurrency(bill.totalAmount || 0);

  try {
    const { blob, filename } = generateBillPDFBlob(bill);
    const file = new File([blob], filename, { type: "application/pdf" });

    // Check device capability for sharing files via Web Share API
    const canShareFiles =
      typeof navigator !== "undefined" &&
      !!navigator.share &&
      !!navigator.canShare &&
      navigator.canShare({ files: [file] });

    if (canShareFiles) {
      const shareText = `Thank you for shopping with ${SHOP_NAME}.\n\nInvoice: ${billNo}\nTotal: ${totalAmount}`;

      await navigator.share({
        title: `${SHOP_NAME} - Invoice ${billNo}`,
        text: shareText,
        files: [file],
      });

      return {
        success: true,
        method: "web-share",
        message: "Share sheet opened. Select WhatsApp to send the invoice.",
      };
    } else {
      // Desktop / Unsupported Browser Fallback
      // Download the PDF automatically so the user can attach it manually
      downloadBillPDF(bill);

      return {
        success: false,
        method: "download-fallback",
        message:
          "PDF file sharing is not supported by this browser. Downloaded the PDF — please attach it manually in WhatsApp.",
      };
    }
  } catch (err) {
    // If the user cancelled the share menu, handle silently without alarming error
    if (err.name === "AbortError" || err.message?.includes("canceled")) {
      return {
        success: false,
        method: "cancelled",
        message: "Sharing cancelled.",
      };
    }

    // Safety fallback: download PDF if native share failed
    try {
      downloadBillPDF(bill);
    } catch {
      // ignore secondary exception
    }

    return {
      success: false,
      method: "error",
      message: "Unable to share PDF directly. Invoice PDF has been downloaded instead.",
    };
  }
};
