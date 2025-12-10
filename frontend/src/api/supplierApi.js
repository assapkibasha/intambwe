// src/api/supplierApi.js
import api from './api';

const supplierApi = {
  getSuppliers: (params) => api.get('/inventory/suppliers', { params }),
  getSupplier: (id) => api.get(`/inventory/suppliers/${id}`),
  createSupplier: (data) => api.post('/inventory/suppliers', data),
  updateSupplier: (id, data) => api.put(`/inventory/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/inventory/suppliers/${id}`),
};

export default supplierApi;
