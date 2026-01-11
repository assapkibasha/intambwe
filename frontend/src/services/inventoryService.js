import api from '../api/api';

class InventoryService {
  async getSummary(params = {}) {
    try {
      const response = await api.get('/inventory/summary', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load inventory summary';
      throw new Error(msg);
    }
  }
}

const inventoryService = new InventoryService();
export default inventoryService;
