// src/api/purchaseOrderApi.js
import api from './api';

const purchaseOrderApi = {
  getPurchaseOrders: (params) => api.get('/inventory/purchase-orders', { params }),
  getPurchaseOrder: (id) => api.get(`/inventory/purchase-orders/${id}`),
  createPurchaseOrder: (data) => api.post('/inventory/purchase-orders', data),
  updatePurchaseOrderStatus: (id, data) => api.patch(`/inventory/purchase-orders/${id}/status`, data),
  receivePurchaseOrderItems: (poId, data) => api.post(`/inventory/purchase-orders/${poId}/receive`, data),
  cancelPurchaseOrder: (id) => api.patch(`/inventory/purchase-orders/${id}/cancel`),
};

export default purchaseOrderApi;
