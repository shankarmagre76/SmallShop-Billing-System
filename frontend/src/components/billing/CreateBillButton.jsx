import React from "react";
import Button from "../common/Button";

const CreateBillButton = ({ disabled = false, loading = false, onClick }) => {
  return (
    <Button
      type="button"
      variant="primary"
      className="w-100 py-2 fw-bold fs-6"
      disabled={disabled || loading}
      loading={loading}
      onClick={onClick}
    >
      <i className="bi bi-check2-circle me-2"></i>
      {loading ? "Creating Bill..." : "Create Bill & Deduct Stock"}
    </Button>
  );
};

export default CreateBillButton;
