import api from '../api/api';

class SalesService {
  async createSale(data) {
    try {
      const response = await api.post('/sales', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create sale';
      throw new Error(msg);
    }
  }

  async getAllSales(params = {}) {
    try {
      const response = await api.get('/sales', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load sales';
      throw new Error(msg);
    }
  }

  async getSaleById(id) {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load sale';
      throw new Error(msg);
    }
  }

  async createReturn(saleId, data) {
    try {
      const response = await api.post(`/sales/${saleId}/returns`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create return';
      throw new Error(msg);
    }
  }

  async listReturns(saleId) {
    try {
      const response = await api.get(`/sales/${saleId}/returns`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load returns';
      throw new Error(msg);
    }
  }
}

const salesService = new SalesService();
export default salesService;
