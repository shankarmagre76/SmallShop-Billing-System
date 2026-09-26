export const STOCK_STATUS_TYPES = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  LOW_STOCK: "LOW_STOCK",
  IN_STOCK: "IN_STOCK",
};

/**
 * Determines stock status category based on quantity and threshold.
 * Uses backend low-stock threshold of 5 as default.
 * @param {number} stockQuantity
 * @param {number} threshold - Default 5
 * @returns {Object} { key, label, bgClass }
 */
export const getStockStatus = (stockQuantity = 0, threshold = 5) => {
  const qty = Number(stockQuantity);

  if (isNaN(qty) || qty <= 0) {
    return {
      key: STOCK_STATUS_TYPES.OUT_OF_STOCK,
      label: "Out of Stock",
      bgClass: "bg-danger",
      textClass: "text-danger",
      badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
    };
  }

  if (qty <= threshold) {
    return {
      key: STOCK_STATUS_TYPES.LOW_STOCK,
      label: "Low Stock",
      bgClass: "bg-warning",
      textClass: "text-warning",
      badgeClass: "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25",
    };
  }

  return {
    key: STOCK_STATUS_TYPES.IN_STOCK,
    label: "In Stock",
    bgClass: "bg-success",
    textClass: "text-success",
    badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
  };
};
