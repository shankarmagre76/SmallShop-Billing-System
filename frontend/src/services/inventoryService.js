import axiosClient from "../api/axiosClient";

/**
 * Gets low stock products where stock <= threshold (default threshold 5). (Staff or Admin)
 * @param {number} threshold
 * @returns {Promise<Array>} List of low stock products
 */
export const getLowStockProducts = async (threshold = 5) => {
  const response = await axiosClient.get("/Inventory/low-stock", {
    params: { threshold },
  });
  return Array.isArray(response.data) ? response.data : response.data.items || [];
};

/**
 * Gets stock details for a product by ID. (Staff or Admin)
 * @param {number} productId
 * @returns {Promise<Object>} StockResponse { productId, productName, sku, stockQuantity, updatedAt }
 */
export const getStock = async (productId) => {
  const response = await axiosClient.get(`/Inventory/${productId}`);
  return response.data;
};

/**
 * Increases stock quantity for a product. (Admin only)
 * @param {number} productId
 * @param {number} quantity
 * @returns {Promise<Object>} StockResponse
 */
export const increaseStock = async (productId, quantity) => {
  const response = await axiosClient.post(`/Inventory/${productId}/increase`, {
    quantity: Number(quantity),
  });
  return response.data;
};

/**
 * Decreases stock quantity for a product. (Admin only)
 * @param {number} productId
 * @param {number} quantity
 * @returns {Promise<Object>} StockResponse
 */
export const decreaseStock = async (productId, quantity) => {
  const response = await axiosClient.post(`/Inventory/${productId}/decrease`, {
    quantity: Number(quantity),
  });
  return response.data;
};
