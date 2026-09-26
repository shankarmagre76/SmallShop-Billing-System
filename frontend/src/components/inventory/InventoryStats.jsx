import React from "react";
import StatCard from "../dashboard/StatCard";

const InventoryStats = ({ products = [], loading = false }) => {
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity ?? p.StockQuantity ?? 0), 0);
  const lowStockCount = products.filter((p) => {
    const q = p.stockQuantity ?? p.StockQuantity ?? 0;
    return q > 0 && q <= 5;
  }).length;
  const outOfStockCount = products.filter((p) => (p.stockQuantity ?? p.StockQuantity ?? 0) <= 0).length;

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Total Catalogue Products"
          value={totalProducts}
          icon="bi-box-seam"
          description="Active products in store"
          loading={loading}
          variant="primary"
        />
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Total Stock Units"
          value={totalStockUnits}
          icon="bi-layers"
          description="Sum of all available units"
          loading={loading}
          variant="info"
        />
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Low Stock Items (≤ 5)"
          value={lowStockCount}
          icon="bi-exclamation-triangle"
          description="Items needing stock adjustment"
          loading={loading}
          variant="warning"
        />
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Out of Stock Items"
          value={outOfStockCount}
          icon="bi-x-circle"
          description="Items with zero units remaining"
          loading={loading}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default InventoryStats;
