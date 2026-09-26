/**
 * Utility functions for frontend UI display calculations.
 * Authoritative calculations are performed by the ASP.NET Core backend.
 */

/**
 * Calculates line subtotal: unitPrice * quantity
 */
export const calculateLineSubtotal = (unitPrice = 0, quantity = 0) => {
  const price = Number(unitPrice) || 0;
  const qty = Number(quantity) || 0;
  return Math.max(0, price * qty);
};

/**
 * Calculates line tax amount: (lineSubtotal * taxRate) / 100
 */
export const calculateLineTax = (unitPrice = 0, quantity = 0, taxRate = 0) => {
  const lineSubtotal = calculateLineSubtotal(unitPrice, quantity);
  const rate = Number(taxRate) || 0;
  return Math.max(0, (lineSubtotal * rate) / 100);
};

/**
 * Calculates line total: lineSubtotal + lineTax
 */
export const calculateLineTotal = (unitPrice = 0, quantity = 0, taxRate = 0) => {
  const subtotal = calculateLineSubtotal(unitPrice, quantity);
  const tax = calculateLineTax(unitPrice, quantity, taxRate);
  return subtotal + tax;
};

/**
 * Calculates total bill subtotal (sum of line subtotals)
 */
export const calculateSubtotal = (items = []) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    return sum + calculateLineSubtotal(item.price ?? item.unitPrice, item.quantity);
  }, 0);
};

/**
 * Calculates total bill tax (sum of line taxes)
 */
export const calculateTax = (items = []) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    return sum + calculateLineTax(item.price ?? item.unitPrice, item.quantity, item.taxRate);
  }, 0);
};

/**
 * Calculates grand total bill amount: subtotal + tax
 */
export const calculateGrandTotal = (items = []) => {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(items);
  return subtotal + tax;
};
