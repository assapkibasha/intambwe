import api from '../api/api';

class StockInService {
  async createStockIn(data) {
    try {
      const response = await api.post('/stock-in', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create stock in';
      throw new Error(msg);
    }
  }

  async getAllStockIn(params = {}) {
    try {
      const response = await api.get('/stock-in', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load stock in records';
      throw new Error(msg);
    }
  }

  async getStockInById(id) {
    try {
      const response = await api.get(`/stock-in/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load stock in record';
      throw new Error(msg);
    }
  }

  async updateStockIn(id, data) {
    try {
      const response = await api.put(`/stock-in/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update stock in';
      throw new Error(msg);
    }
  }

  async updateStatus(id, status) {
    try {
      const response = await api.patch(`/stock-in/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update status';
      throw new Error(msg);
    }
  }

  async deleteStockIn(id) {
    try {
      const response = await api.delete(`/stock-in/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to delete stock in';
      throw new Error(msg);
    }
  }

  async listItems(stockInId) {
    try {
      const response = await api.get(`/stock-in/${stockInId}/items`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load stock items';
      throw new Error(msg);
    }
  }

  async addItems(stockInId, items) {
    try {
      const response = await api.post(`/stock-in/${stockInId}/items`, { items });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to add stock items';
      throw new Error(msg);
    }
  }
}

const stockInService = new StockInService();
export default stockInService;
