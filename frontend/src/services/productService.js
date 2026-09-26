import axiosClient from "../api/axiosClient";

/**
 * Normalizes paginated or array API response.
 * @param {Object|Array} data
 * @returns {Object} { items: Array, totalCount: number, page: number, pageSize: number, totalPages: number }
 */
const normalizePagedResponse = (data) => {
  if (!data) {
    return { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 1 };
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      page: 1,
      pageSize: data.length || 10,
      totalPages: 1,
    };
  }

  return {
    items: Array.isArray(data.items) ? data.items : [],
    totalCount: typeof data.totalCount === "number" ? data.totalCount : (data.items?.length || 0),
    page: data.page || 1,
    pageSize: data.pageSize || 10,
    totalPages: data.totalPages || 1,
    hasPreviousPage: !!data.hasPreviousPage,
    hasNextPage: !!data.hasNextPage,
  };
};

/**
 * Gets paginated products list. (Staff or Admin)
 */
export const getProducts = async (page = 1, pageSize = 10) => {
  const response = await axiosClient.get("/Products", {
    params: { page, pageSize },
  });
  return normalizePagedResponse(response.data);
};

/**
 * Searches active products by name or SKU. (Staff or Admin)
 */
export const searchProducts = async (query, page = 1, pageSize = 10) => {
  const response = await axiosClient.get("/Products/search", {
    params: { query: query || "", page, pageSize },
  });
  return normalizePagedResponse(response.data);
};

/**
 * Gets product details by ID. (Staff or Admin)
 */
export const getProductById = async (id) => {
  const response = await axiosClient.get(`/Products/${id}`);
  return response.data;
};

/**
 * Creates a new product. (Admin only)
 * @param {Object} productData - { name, sku, description, price, stockQuantity, taxRate }
 */
export const createProduct = async (productData) => {
  const response = await axiosClient.post("/Products", {
    name: productData.name,
    sku: productData.sku,
    description: productData.description || null,
    price: Number(productData.price),
    stockQuantity: Number(productData.stockQuantity),
    taxRate: Number(productData.taxRate),
  });
  return response.data;
};

/**
 * Updates an existing product. (Admin only)
 * @param {number} id
 * @param {Object} productData - { name, description, price, taxRate, isActive }
 */
export const updateProduct = async (id, productData) => {
  const response = await axiosClient.put(`/Products/${id}`, {
    name: productData.name,
    description: productData.description || null,
    price: Number(productData.price),
    taxRate: Number(productData.taxRate),
    isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
  });
  return response.data;
};

/**
 * Soft deactivates a product. (Admin only)
 * @param {number} id
 */
export const deactivateProduct = async (id) => {
  const response = await axiosClient.delete(`/Products/${id}`);
  return response.data;
};
