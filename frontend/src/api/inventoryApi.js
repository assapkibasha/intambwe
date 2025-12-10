// src/api/inventoryApi.js
import api from './api';

const inventoryApi = {
  // Items
  getItems: (params) => api.get('/inventory', { params }),
  getItem: (id) => api.get(`/inventory/${id}`),
  createItem: (data) => api.post('/inventory', data),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  getInventoryStats: () => api.get('/inventory/stats/overview'),
  getLowStockItems: (params) => api.get('/inventory/low-stock/items', { params }),
  getExpiredItems: (params) => api.get('/inventory/expired/items', { params }),
  getItemsByLocation: (locationId, params) => api.get(`/inventory/locations/${locationId}/items`, { params }),
};

export default inventoryApi;
