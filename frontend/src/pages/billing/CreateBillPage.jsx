import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import ErrorMessage from "../../components/common/ErrorMessage";
import ToastNotification from "../../components/common/ToastNotification";
import ProductSelector from "../../components/billing/ProductSelector";
import BillCart from "../../components/billing/BillCart";
import BillSummary from "../../components/billing/BillSummary";
import CreateBillButton from "../../components/billing/CreateBillButton";
import BillSuccess from "../../components/billing/BillSuccess";
import * as billService from "../../services/billService";
import { getErrorMessage } from "../../utils/errorHandler";

const CreateBillPage = () => {
  const [customerName, setCustomerName] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [completedBill, setCompletedBill] = useState(null);

  // Add Product to Cart
  const handleAddToCart = (product) => {
    setError("");
    const stockQty = product.stockQuantity ?? product.StockQuantity ?? 0;
    if (stockQty <= 0) {
      setToast({ message: "Product is out of stock.", type: "warning" });
      return;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity;
        if (currentQty >= stockQty) {
          setToast({
            message: `Cannot add more. Maximum available stock is ${stockQty} units.`,
            type: "warning",
          });
          return prevItems;
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku || product.SKU,
          price: product.price,
          taxRate: product.taxRate || product.TaxRate || 0,
          stockQuantity: stockQty,
          quantity: 1,
        },
      ];
    });
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          const maxStock = item.stockQuantity ?? 999;
          const validQty = Math.max(1, Math.min(newQuantity, maxStock));
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (productId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.productId !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
    setCustomerName("");
  };

  // Submit Bill (CreateBillRequest -> POST /api/Bills)
  const handleCreateBill = async () => {
    setError("");

    if (cartItems.length === 0) {
      setError("Please add at least one product item to create a bill.");
      return;
    }

    // Client validation
    for (const item of cartItems) {
      if (!item.quantity || item.quantity < 1) {
        setError(`Invalid quantity for ${item.name}. Must be at least 1.`);
        return;
      }
      if (item.quantity > item.stockQuantity) {
        setError(`Quantity for ${item.name} exceeds available stock (${item.stockQuantity} units).`);
        return;
      }
    }

    setLoading(true);

    try {
      const created = await billService.createBill({
        customerName: customerName,
        items: cartItems,
      });

      // Clear cart on success
      setCartItems([]);
      setCustomerName("");
      setCompletedBill(created);
      setToast({ message: "Bill created successfully!", type: "success" });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to create bills.");
      } else if (err.response && err.response.status === 409) {
        setError("Stock changed while creating the bill. Please review the quantities and try again.");
      } else if (err.response && err.response.status === 400 && err.response.data?.message?.includes("stock")) {
        setError("Insufficient stock for one or more selected products.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset for creating another bill
  const handleCreateAnotherBill = () => {
    setCompletedBill(null);
    setCartItems([]);
    setCustomerName("");
    setError("");
  };

  if (completedBill) {
    return (
      <div className="container-fluid p-0">
        <PageHeader
          title="Bill Invoice Confirmation"
          subtitle="Authorized sales transaction summary and stock deduction confirmation"
        />
        <BillSuccess bill={completedBill} onCreateAnother={handleCreateAnotherBill} />
      </div>
    );
  }

  const cartProductIds = cartItems.map((i) => i.productId);

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Create New Bill"
        subtitle="Generate customer invoice with automatic tax calculation and atomic stock deduction."
      />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <ErrorMessage message={error} onDismiss={() => setError("")} />

      <div className="row g-4">
        {/* Left Column: Product Selection Console */}
        <div className="col-12 col-lg-6">
          <ProductSelector
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
          />
        </div>

        {/* Right Column: Customer Details, Cart, Totals & Checkout Button */}
        <div className="col-12 col-lg-6">
          {/* Customer Name Input */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body py-3">
              <label className="form-label fw-semibold small mb-1">
                Customer Name <span className="text-muted font-normal">(Optional)</span>
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <BillCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />

          {/* Totals Summary Preview */}
          <BillSummary
            cartItems={cartItems}
            customerName={customerName}
          />

          {/* Create Bill Checkout Action */}
          <CreateBillButton
            disabled={cartItems.length === 0}
            loading={loading}
            onClick={handleCreateBill}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateBillPage;
