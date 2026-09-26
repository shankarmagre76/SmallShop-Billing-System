import React, { useState } from "react";
import BillCartItem from "./BillCartItem";
import EmptyState from "../common/EmptyState";
import ConfirmModal from "../common/ConfirmModal";

const BillCart = ({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleConfirmClear = () => {
    onClearCart();
    setShowClearConfirm(false);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-cart3 text-primary fs-5"></i>
            <h6 className="fw-bold mb-0">Bill Cart Items (0)</h6>
          </div>
        </div>
        <div className="card-body p-0">
          <EmptyState
            title="No products added yet."
            message="Search for a product above to start creating a bill."
            icon="bi-cart3"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-cart3 text-primary fs-5"></i>
          <h6 className="fw-bold mb-0">
            Bill Cart Items <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
          </h6>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm px-2 py-1"
          onClick={() => setShowClearConfirm(true)}
        >
          <i className="bi bi-trash me-1"></i>
          Clear Cart
        </button>
      </div>

      <div className="card-body p-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {cartItems.map((item) => (
          <BillCartItem
            key={item.productId}
            item={item}
            onQuantityChange={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Confirmation modal before clearing cart */}
      <ConfirmModal
        show={showClearConfirm}
        title="Clear Cart Items"
        message="Are you sure you want to clear all items from this bill?"
        confirmText="Clear Cart"
        confirmVariant="danger"
        onConfirm={handleConfirmClear}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default BillCart;
