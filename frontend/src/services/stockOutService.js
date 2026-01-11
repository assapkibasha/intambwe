import api from '../api/api';

class StockOutService {
  async createStockOut(data) {
    try {
      const response = await api.post('/stock-out', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create stock out';
      throw new Error(msg);
    }
  }

  async getAllStockOut(params = {}) {
    try {
      const response = await api.get('/stock-out', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load stock out records';
      throw new Error(msg);
    }
  }

  async getStockOutById(id) {
    try {
      const response = await api.get(`/stock-out/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load stock out record';
      throw new Error(msg);
    }
  }
}

const stockOutService = new StockOutService();
export default stockOutService;
