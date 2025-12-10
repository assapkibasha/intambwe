// src/api/stockAdjustmentApi.js
import api from './api';

const stockAdjustmentApi = {
  getAdjustments: (params) => api.get('/inventory/adjustments', { params }),
  getAdjustment: (id) => api.get(`/inventory/adjustments/${id}`),
  createAdjustment: (data) => api.post('/inventory/adjustments', data),
};

export default stockAdjustmentApi;
