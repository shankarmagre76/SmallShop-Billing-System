import axiosClient from "../api/axiosClient";

/**
 * Creates a new bill with itemized line calculations & atomic stock deduction. (Staff or Admin)
 * Sends exact CreateBillRequest payload expected by backend.
 * @param {Object} billData - { customerName?: string, items: Array<{ productId: number, quantity: number }> }
 * @returns {Promise<Object>} BillResponse { id, billNumber, customerName, items, subTotal, taxAmount, totalAmount, createdAt }
 */
export const createBill = async (billData) => {
  const requestPayload = {
    customerName: billData.customerName?.trim() ? billData.customerName.trim() : null,
    items: (billData.items || []).map((item) => ({
      productId: Number(item.productId || item.id),
      quantity: Number(item.quantity),
    })),
  };

  const response = await axiosClient.post("/Bills", requestPayload);
  return response.data;
};

/**
 * Gets paginated bills list. (Staff or Admin)
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<Object>} PagedResponse<BillListResponse>
 */
export const getBills = async (page = 1, pageSize = 10) => {
  const response = await axiosClient.get("/Bills", {
    params: { page, pageSize },
  });
  return response.data;
};

/**
 * Gets detailed bill by ID. (Staff or Admin)
 * @param {number} id
 * @returns {Promise<Object>} BillResponse
 */
export const getBillById = async (id) => {
  const response = await axiosClient.get(`/Bills/${id}`);
  return response.data;
};
