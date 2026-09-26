import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ToastNotification from "../../components/common/ToastNotification";
import Pagination from "../../components/common/Pagination";
import InventoryStats from "../../components/inventory/InventoryStats";
import InventoryTable from "../../components/inventory/InventoryTable";
import StockAdjustmentModal from "../../components/inventory/StockAdjustmentModal";
import ProductDetails from "../../components/products/ProductDetails";
import * as productService from "../../services/productService";
import * as inventoryService from "../../services/inventoryService";
import { getErrorMessage } from "../../utils/errorHandler";

const InventoryPage = () => {
  const { role } = useAuth();
  const isAdmin = role === "Admin";

  const [productsData, setProductsData] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "low_stock" | "out_of_stock"
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [adjustmentProduct, setAdjustmentProduct] = useState(null);
  const [adjustmentMode, setAdjustmentMode] = useState("increase"); // "increase" | "decrease"
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const fetchInventory = useCallback(async (page = 1, query = "", tab = "all") => {
    setLoading(true);
    setError("");

    try {
      let res;
      if (tab === "low_stock") {
        // Use backend dedicated low stock endpoint
        const lowStockItems = await inventoryService.getLowStockProducts(5);
        let filtered = lowStockItems;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          filtered = lowStockItems.filter(
            (item) => item.name?.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q)
          );
        }
        res = {
          items: filtered,
          totalCount: filtered.length,
          page: 1,
          pageSize: filtered.length || 10,
          totalPages: 1,
        };
      } else if (query.trim()) {
        res = await productService.searchProducts(query.trim(), page, 10);
      } else {
        res = await productService.getProducts(page, 10);
      }

      setProductsData(res);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to view inventory records.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory(currentPage, searchQuery, filterTab);
  }, [currentPage, searchQuery, filterTab, fetchInventory]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  // View Product Details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Open Stock Increase Modal
  const handleOpenIncreaseModal = (product) => {
    if (!isAdmin) {
      setToast({
        message: "You do not have permission to modify inventory.",
        type: "danger",
      });
      return;
    }
    setAdjustmentMode("increase");
    setAdjustmentProduct(product);
    setShowAdjustmentModal(true);
  };

  // Open Stock Decrease Modal
  const handleOpenDecreaseModal = (product) => {
    if (!isAdmin) {
      setToast({
        message: "You do not have permission to modify inventory.",
        type: "danger",
      });
      return;
    }
    setAdjustmentMode("decrease");
    setAdjustmentProduct(product);
    setShowAdjustmentModal(true);
  };

  // Handle Stock Adjustment Confirm (API Call)
  const handleStockAdjustmentConfirm = async (quantity) => {
    if (!adjustmentProduct) return;

    try {
      if (adjustmentMode === "increase") {
        await inventoryService.increaseStock(adjustmentProduct.id, quantity);
        setToast({ message: "Stock increased successfully.", type: "success" });
      } else {
        await inventoryService.decreaseStock(adjustmentProduct.id, quantity);
        setToast({ message: "Stock decreased successfully.", type: "success" });
      }
      // Refresh inventory data from backend API
      fetchInventory(currentPage, searchQuery, filterTab);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setToast({ message: "You do not have permission to modify inventory.", type: "danger" });
      } else if (err.response && err.response.status === 400 && err.response.data?.message?.includes("stock")) {
        setToast({ message: "Insufficient stock available.", type: "danger" });
      } else if (err.response && err.response.status === 409) {
        setToast({ message: "Stock was changed by another operation. Please refresh and try again.", type: "danger" });
      } else {
        setToast({ message: getErrorMessage(err) || "Unable to update stock.", type: "danger" });
      }
      throw err;
    }
  };

  // Filter items by Tab on frontend if not low_stock tab
  const displayedItems = (productsData.items || []).filter((item) => {
    const qty = item.stockQuantity ?? item.StockQuantity ?? 0;
    if (filterTab === "out_of_stock") return qty <= 0;
    if (filterTab === "low_stock") return qty > 0 && qty <= 5;
    return true;
  });

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Inventory Management"
        subtitle="Monitor product stock levels, perform stock adjustments, and track stock warnings."
      />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <ErrorMessage message={error} onDismiss={() => setError("")} />

      {/* Inventory Statistics Overview Cards */}
      <InventoryStats products={productsData.items || []} loading={loading} />

      {/* Search and Tab Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-center justify-content-between">
            {/* Filter Tabs */}
            <div className="col-12 col-md-6">
              <div className="btn-group btn-group-sm w-100 w-sm-auto" role="group">
                <button
                  type="button"
                  className={`btn ${filterTab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => handleTabChange("all")}
                >
                  All Products
                </button>
                <button
                  type="button"
                  className={`btn ${filterTab === "low_stock" ? "btn-warning" : "btn-outline-secondary"}`}
                  onClick={() => handleTabChange("low_stock")}
                >
                  <i className="bi bi-exclamation-triangle me-1"></i> Low Stock (≤ 5)
                </button>
                <button
                  type="button"
                  className={`btn ${filterTab === "out_of_stock" ? "btn-danger" : "btn-outline-secondary"}`}
                  onClick={() => handleTabChange("out_of_stock")}
                >
                  <i className="bi bi-x-circle me-1"></i> Out of Stock
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search inventory by name or SKU..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary bg-light border-start-0"
                    type="button"
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="py-5">
              <LoadingSpinner message="Fetching current stock levels..." />
            </div>
          ) : (
            <InventoryTable
              products={displayedItems}
              isAdmin={isAdmin}
              onViewProduct={handleViewProduct}
              onOpenIncreaseModal={handleOpenIncreaseModal}
              onOpenDecreaseModal={handleOpenDecreaseModal}
            />
          )}
        </div>

        {!loading && filterTab === "all" && productsData.totalCount > 0 && (
          <Pagination
            currentPage={productsData.page}
            totalPages={productsData.totalPages}
            totalCount={productsData.totalCount}
            pageSize={productsData.pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Product View Modal */}
      <ProductDetails
        show={showViewModal}
        product={selectedProduct}
        onClose={() => setShowViewModal(false)}
      />

      {/* Stock Increase / Decrease Adjustment Modal */}
      <StockAdjustmentModal
        show={showAdjustmentModal}
        mode={adjustmentMode}
        product={adjustmentProduct}
        onConfirm={handleStockAdjustmentConfirm}
        onClose={() => setShowAdjustmentModal(false)}
      />
    </div>
  );
};

export default InventoryPage;
