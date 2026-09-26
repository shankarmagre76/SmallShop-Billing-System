import { formatCurrency, formatDate } from "./formatters.js";

/**
 * Formats a clean WhatsApp text receipt for a bill.
 * @param {Object} bill - Bill response object containing { id, billNumber, customerName, createdAt, items, subTotal, taxAmount, totalAmount }
 * @returns {string} Formatted text with markdown formatting for WhatsApp
 */
export const generateWhatsAppBillText = (bill) => {
  if (!bill) return "";

  const itemsList = (bill.items || [])
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName || "Product"}* (SKU: ${item.sku || item.SKU || "N/A"})\n   ${item.quantity} x ${formatCurrency(item.unitPrice || 0)} = ${formatCurrency(item.lineTotal || 0)}`
    )
    .join("\n");

  const message = `🧾 *SMALL SHOP INVOICE*
--------------------------------
*Invoice No:* ${bill.billNumber || `#${bill.id}`}
*Date:* ${formatDate(bill.createdAt, true)}
*Customer:* ${bill.customerName || "Walk-in Customer"}

*Items Purchased:*
${itemsList || "N/A"}

--------------------------------
*Subtotal:* ${formatCurrency(bill.subTotal || 0)}
*GST Tax:* ${formatCurrency(bill.taxAmount || 0)}
*Grand Total:* ${formatCurrency(bill.totalAmount || 0)}
--------------------------------
Thank you for shopping with us! 🙏`;

  return message;
};

/**
 * Generates WhatsApp API click-to-chat URL.
 * @param {Object} bill
 * @param {string} phoneNumber - Optional customer phone number (with or without country code)
 * @returns {string} WhatsApp web/app URL
 */
export const getWhatsAppShareUrl = (bill, phoneNumber = "") => {
  const text = generateWhatsAppBillText(bill);
  const encodedText = encodeURIComponent(text);
  const cleanPhone = (phoneNumber || "").replace(/[^0-9]/g, "");

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Opens WhatsApp sharing in a new window/tab.
 * @param {Object} bill
 * @param {string} phoneNumber - Optional target phone number
 */
export const shareBillOnWhatsApp = (bill, phoneNumber = "") => {
  const url = getWhatsAppShareUrl(bill, phoneNumber);
  window.open(url, "_blank", "noopener,noreferrer");
};
