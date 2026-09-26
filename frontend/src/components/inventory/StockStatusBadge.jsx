import React from "react";
import { getStockStatus } from "../../utils/stockStatus";

const StockStatusBadge = ({ stockQuantity = 0, threshold = 5 }) => {
  const status = getStockStatus(stockQuantity, threshold);

  return (
    <span className={`badge ${status.badgeClass} px-2 py-1 fw-semibold`}>
      {status.label}
    </span>
  );
};

export default StockStatusBadge;
