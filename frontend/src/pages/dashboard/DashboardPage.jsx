import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import QuickAction from "../../components/dashboard/QuickAction";
import RecentActivity from "../../components/dashboard/RecentActivity";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getHealthCheck } from "../../services/healthService";
import { getProducts } from "../../services/productService";
import { getBills } from "../../services/billService";
import { getLowStockProducts } from "../../services/inventoryService";
import { formatCurrency, formatDate, toISTDateString } from "../../utils/formatters";
import { ROUTES } from "../../constants/routes";

const DashboardPage = () => {
  const { user } = useAuth();

  const [apiHealth, setApiHealth] = useState({ loading: true, connected: false });
  const [stats, setStats] = useState({
    productsCount: null,
    lowStockCount: null,
    billsCount: null,
    todaySales: null,
  });

  const [errors, setErrors] = useState({
    products: null,
    lowStock: null,
    bills: null,
  });

  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrors({ products: null, lowStock: null, bills: null });

    // 1. Health check
    try {
      const healthRes = await getHealthCheck();
      setApiHealth({ loading: false, connected: healthRes.connected });
    } catch {
      setApiHealth({ loading: false, connected: false });
    }

    // 2. Concurrent fetching with Promise.allSettled for fault isolation
    const results = await Promise.allSettled([
      getProducts(1, 1),
      getLowStockProducts(5),
      getBills(1, 10),
    ]);

    const [productsResult, lowStockResult, billsResult] = results;

    let pCount = null;
    let errP = null;
    if (productsResult.status === "fulfilled" && productsResult.value) {
      pCount = productsResult.value.totalCount ?? (Array.isArray(productsResult.value.items) ? productsResult.value.items.length : 0);
    } else if (productsResult.status === "rejected") {
      errP = "Unable to load products count";
    }

    let lsCount = null;
    let errLS = null;
    if (lowStockResult.status === "fulfilled" && lowStockResult.value) {
      lsCount = Array.isArray(lowStockResult.value) ? lowStockResult.value.length : 0;
    } else if (lowStockResult.status === "rejected") {
      errLS = "Unable to load low stock count";
    }

    let bCount = null;
    let todaySalesTotal = null;
    let billList = [];
    let errB = null;

    if (billsResult.status === "fulfilled" && billsResult.value) {
      const bValue = billsResult.value;
      bCount = bValue.totalCount ?? (Array.isArray(bValue.items) ? bValue.items.length : 0);
      billList = Array.isArray(bValue.items) ? bValue.items : Array.isArray(bValue) ? bValue : [];

      // Calculate today's sales from bills created today (in IST)
      const todayIST = toISTDateString(new Date());
      const todayBills = billList.filter(
        (b) => b.createdAt && toISTDateString(b.createdAt) === todayIST
      );
      todaySalesTotal = todayBills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    } else if (billsResult.status === "rejected") {
      errB = "Unable to load bills summary";
    }

    setStats({
      productsCount: pCount,
      lowStockCount: lsCount,
      billsCount: bCount,
      todaySales: todaySalesTotal !== null ? formatCurrency(todaySalesTotal) : null,
    });

    setErrors({
      products: errP,
      lowStock: errLS,
      bills: errB,
    });

    setRecentBills(
      billList.slice(0, 5).map((bill) => ({
        id: bill.id,
        title: `Invoice ${bill.billNumber || `#${bill.id}`}`,
        subtitle: bill.createdAt ? formatDate(bill.createdAt) : "Recent",
        amount: bill.totalAmount || 0,
      }))
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title={`Welcome back, ${user?.fullName || "Staff Member"} 👋`}
        subtitle="Manage your shop's products, inventory and billing from one place."
      >
        <Link to={ROUTES.BILLING} className="btn btn-primary d-flex align-items-center gap-2 py-2">
          <i className="bi bi-plus-lg"></i>
          <span>Create New Bill</span>
        </Link>
      </PageHeader>

      {/* API Connection Health Banner */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-hdd-network text-primary fs-5"></i>
              <span className="fw-semibold">API Health Status:</span>
              {apiHealth.loading ? (
                <span className="badge bg-warning text-dark px-2 py-1">Checking API...</span>
              ) : apiHealth.connected ? (
                <span className="badge bg-success px-2 py-1 d-flex align-items-center gap-1">
                  <span className="spinner-grow spinner-grow-sm" style={{ width: "6px", height: "6px" }}></span>
                  Connected (HTTP 200 OK)
                </span>
              ) : (
                <span className="badge bg-danger px-2 py-1">API Unavailable</span>
              )}
            </div>

            <div className="small text-muted d-flex align-items-center gap-2">
              <span>Endpoint: <code>{import.meta.env.VITE_API_BASE_URL || "http://localhost:5206/api"}</code></span>
              <button
                onClick={fetchDashboardData}
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                disabled={loading}
                title="Refresh Dashboard Data"
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Products"
            value={errors.products ? "Unable to load" : stats.productsCount}
            icon="bi-box-seam"
            description="Active products in catalogue"
            loading={loading}
            link={ROUTES.PRODUCTS}
            variant="primary"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Low Stock Items (≤ 5)"
            value={errors.lowStock ? "Unable to load" : stats.lowStockCount}
            icon="bi-clipboard-data"
            description="Products requiring stock restock"
            loading={loading}
            link={ROUTES.INVENTORY}
            variant="warning"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Bills"
            value={errors.bills ? "Unable to load" : stats.billsCount}
            icon="bi-receipt"
            description="Total generated sales invoices"
            loading={loading}
            link={ROUTES.BILLS}
            variant="info"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Today's Sales"
            value={stats.todaySales !== null ? stats.todaySales : "—"}
            icon="bi-currency-dollar"
            description="Sum of today's bill totals"
            loading={loading}
            link={ROUTES.BILLS}
            variant="success"
          />
        </div>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom fw-bold py-3">
              <i className="bi bi-lightning-charge text-warning me-2"></i>
              Quick Actions
            </div>
            <div className="card-body p-3">
              <div className="d-grid gap-3">
                <QuickAction
                  title="+ Add Product"
                  description="Add new item to shop inventory catalogue"
                  icon="bi-box-seam"
                  to={ROUTES.PRODUCTS}
                />
                <QuickAction
                  title="+ Create Bill"
                  description="Generate invoice and process customer billing"
                  icon="bi-receipt"
                  to={ROUTES.BILLING}
                />
                <QuickAction
                  title="View Inventory"
                  description="Audit stock levels and check product quantities"
                  icon="bi-clipboard-data"
                  to={ROUTES.INVENTORY}
                />
                <QuickAction
                  title="View Bills"
                  description="Browse past sales history and invoice details"
                  icon="bi-file-earmark-text"
                  to={ROUTES.BILLS}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <RecentActivity
            activities={recentBills}
            loading={loading}
            error={errors.bills}
            onRetry={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
