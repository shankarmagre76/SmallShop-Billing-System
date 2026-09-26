/**
 * Formats a numeric value into Indian Rupee currency string.
 * Example: 1000 => "₹1,000.00"
 * @param {number|string} amount
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats an ISO date string into readable Indian Standard Time (IST) format.
 * Example: "2026-09-27T02:49:29Z" => "27 Sep 2026, 08:19 AM"
 * Enforces Asia/Kolkata timezone.
 * @param {string|Date} dateString
 * @param {boolean} includeTimezone - Optional flag to append "IST" to result
 * @returns {string} Formatted date string or "N/A"
 */
export const formatDate = (dateString, includeTimezone = false) => {
  if (!dateString) return "N/A";
  try {
    let str = typeof dateString === "string" ? dateString : dateString.toISOString();
    // If raw ISO string doesn't include timezone offset or Z suffix, assume UTC
    if (typeof dateString === "string" && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
      str += "Z";
    }

    const date = new Date(str);
    if (isNaN(date.getTime())) return "N/A";

    const formatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return includeTimezone ? `${formatted} IST` : formatted;
  } catch {
    return "N/A";
  }
};

/**
 * Returns YYYY-MM-DD date string in Indian Standard Time (IST) for date filtering and comparisons.
 * @param {string|Date} dateInput
 * @returns {string} YYYY-MM-DD string in IST timezone
 */
export const toISTDateString = (dateInput = new Date()) => {
  if (!dateInput) return "";
  try {
    let str = typeof dateInput === "string" ? dateInput : dateInput.toISOString();
    if (typeof dateInput === "string" && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
      str += "Z";
    }

    const date = new Date(str);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  } catch {
    return "";
  }
};

/**
 * Formats stock quantity display string.
 * Example: 25 => "25 units", 0 => "0 units"
 * @param {number} stock
 * @returns {string}
 */
export const formatStock = (stock) => {
  const qty = Number(stock);
  if (isNaN(qty)) return "0 units";
  return `${qty} units`;
};
