import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ToastNotification from "../../components/common/ToastNotification";
import Pagination from "../../components/common/Pagination";
import ProductFilters from "../../components/products/ProductFilters";
import ProductTable from "../../components/products/ProductTable";
import ProductDetails from "../../components/products/ProductDetails";
import ProductForm from "./ProductForm";
import * as productService from "../../services/productService";
import { getErrorMessage } from "../../utils/errorHandler";

const ProductsPage = () => {
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
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const fetchProducts = useCallback(async (page = 1, query = "") => {
    setLoading(true);
    setError("");

    try {
      let res;
      if (query.trim()) {
        res = await productService.searchProducts(query.trim(), page, 10);
      } else {
        res = await productService.getProducts(page, 10);
      }
      setProductsData(res);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to view product catalogue.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchProducts]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // View Product Details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Open Create Form
  const handleOpenCreateForm = () => {
    if (!isAdmin) {
      setToast({
        message: "You do not have permission to perform this action.",
        type: "danger",
      });
      return;
    }
    setFormMode("create");
    setEditingProduct(null);
    setShowFormModal(true);
  };

  // Open Edit Form
  const handleOpenEditForm = (product) => {
    if (!isAdmin) {
      setToast({
        message: "You do not have permission to perform this action.",
        type: "danger",
      });
      return;
    }
    setFormMode("edit");
    setEditingProduct(product);
    setShowFormModal(true);
  };

  // Form Submit Handler (Create or Update)
  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === "create") {
        await productService.createProduct(formData);
        setToast({ message: "Product created successfully.", type: "success" });
      } else {
        await productService.updateProduct(editingProduct.id, formData);
        setToast({ message: "Product updated successfully.", type: "success" });
      }
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setToast({ message: "You do not have permission to perform this action.", type: "danger" });
      } else {
        const errMsg = getErrorMessage(err);
        setToast({ message: errMsg || "Operation failed.", type: "danger" });
      }
      throw err;
    }
  };

  // Deactivate Product Handler
  const handleDeactivateProduct = async (id) => {
    if (!isAdmin) {
      setToast({
        message: "You do not have permission to perform this action.",
        type: "danger",
      });
      return;
    }

    try {
      await productService.deactivateProduct(id);
      setToast({ message: "Product deactivated successfully.", type: "success" });
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setToast({ message: "You do not have permission to perform this action.", type: "danger" });
      } else {
        setToast({ message: getErrorMessage(err), type: "danger" });
      }
    }
  };

  // Filter products by active status if status filter is selected
  const displayedItems = (productsData.items || []).filter((item) => {
    if (statusFilter === "active") return item.isActive === true;
    if (statusFilter === "inactive") return item.isActive === false;
    return true;
  });

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Products"
        subtitle="Manage your shop products and inventory information."
      >
        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="btn btn-primary d-flex align-items-center gap-2 py-2"
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add Product</span>
          </button>
        )}
      </PageHeader>

      <ToastNotification
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <ErrorMessage message={error} onDismiss={() => setError("")} />

      {/* Filter and Search Bar */}
      <ProductFilters
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        initialSearch={searchQuery}
      />

      {/* Product List Table / Loading / Empty */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="py-5">
              <LoadingSpinner message="Loading products catalogue..." />
            </div>
          ) : (
            <ProductTable
              products={displayedItems}
              isAdmin={isAdmin}
              onViewProduct={handleViewProduct}
              onEditProduct={handleOpenEditForm}
              onDeactivateProduct={handleDeactivateProduct}
              onAddNewProduct={handleOpenCreateForm}
            />
          )}
        </div>

        {!loading && productsData.totalCount > 0 && (
          <Pagination
            currentPage={productsData.page}
            totalPages={productsData.totalPages}
            totalCount={productsData.totalCount}
            pageSize={productsData.pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* View Product Details Modal */}
      <ProductDetails
        show={showViewModal}
        product={selectedProduct}
        onClose={() => setShowViewModal(false)}
        onEdit={isAdmin ? handleOpenEditForm : null}
      />

      {/* Add / Edit Product Modal */}
      <ProductForm
        show={showFormModal}
        mode={formMode}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onClose={() => setShowFormModal(false)}
      />
    </div>
  );
};

export default ProductsPage;
