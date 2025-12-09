import api from '../api/api';

class InventoryService {
  async listItems(params = {}) {
    const response = await api.get('/inventory', { params });
    return response.data;
  }

  async getItem(id) {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  }

  async createItem(data) {
    const response = await api.post('/inventory', data);
    return response.data;
  }

  async updateItem(id, data) {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  }

  async deleteItem(id) {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }

  // Requests
  async createRequest(data) {
    const response = await api.post('/inventory/requests', data);
    return response.data;
  }

  async listRequests(params = {}) {
    const response = await api.get('/inventory/requests', { params });
    return response.data;
  }

  async approveRequest(id) {
    const response = await api.post(`/inventory/requests/${id}/approve`);
    return response.data;
  }

  async rejectRequest(id, reason) {
    const response = await api.post(`/inventory/requests/${id}/reject`, { reason });
    return response.data;
  }

  // Categories
  async listCategories() {
    const response = await api.get('/inventory/categories');
    return response.data;
  }

  async createCategory(data) {
    const response = await api.post('/inventory/categories', data);
    return response.data;
  }

  async updateCategory(id, data) {
    const response = await api.put(`/inventory/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await api.delete(`/inventory/categories/${id}`);
    return response.data;
  }

  // Stock operations
  async stockIn(data) {
    const response = await api.post('/inventory/stock/in', data);
    return response.data;
  }

  async stockOut(data) {
    const response = await api.post('/inventory/stock/out', data);
    return response.data;
  }

  async listTransactions(params = {}) {
    const response = await api.get('/inventory/stock/transactions', { params });
    return response.data;
  }
}

const inventoryService = new InventoryService();
export default inventoryService;
