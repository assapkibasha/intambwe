// src/api/reportApi.js
import api from './api';

const reportApi = {
  generateReport: (data) => api.post('/inventory/reports/generate', data),
  getReports: (params) => api.get('/inventory/reports', { params }),
  getReport: (id) => api.get(`/inventory/reports/${id}`),
  getStockBalanceReport: () => api.get('/inventory/reports/balance/summary'),
};

export default reportApi;
