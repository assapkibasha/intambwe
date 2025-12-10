import api from '../api/api';

class InventoryService {
  // ===== INVENTORY ITEMS =====
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

  async getInventoryStats() {
    const response = await api.get('/inventory/stats/overview');
    return response.data;
  }

  async getLowStockItems(params = {}) {
    const response = await api.get('/inventory/low-stock/items', { params });
    return response.data;
  }

  async getExpiredItems(params = {}) {
    const response = await api.get('/inventory/expired/items', { params });
    return response.data;
  }

  async getItemsByLocation(locationId, params = {}) {
    const response = await api.get(`/inventory/locations/${locationId}/items`, { params });
    return response.data;
  }

  // ===== SUPPLIERS =====
  async listSuppliers(params = {}) {
    const response = await api.get('/inventory/suppliers', { params });
    return response.data;
  }

  async getSupplier(id) {
    const response = await api.get(`/inventory/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data) {
    const response = await api.post('/inventory/suppliers', data);
    return response.data;
  }

  async updateSupplier(id, data) {
    const response = await api.put(`/inventory/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id) {
    const response = await api.delete(`/inventory/suppliers/${id}`);
    return response.data;
  }

  // ===== LOCATIONS =====
  async listLocations(params = {}) {
    const response = await api.get('/inventory/locations', { params });
    return response.data;
  }

  async getLocation(id) {
    const response = await api.get(`/inventory/locations/${id}`);
    return response.data;
  }

  async createLocation(data) {
    const response = await api.post('/inventory/locations', data);
    return response.data;
  }

  async updateLocation(id, data) {
    const response = await api.put(`/inventory/locations/${id}`, data);
    return response.data;
  }

  async deleteLocation(id) {
    const response = await api.delete(`/inventory/locations/${id}`);
    return response.data;
  }

  async addItemToLocation(data) {
    const response = await api.post('/inventory/locations/item-mapping/add', data);
    return response.data;
  }

  async removeItemFromLocation(itemLocationId) {
    const response = await api.delete(`/inventory/locations/item-mapping/${itemLocationId}`);
    return response.data;
  }

  // ===== PURCHASE ORDERS =====
  async listPurchaseOrders(params = {}) {
    const response = await api.get('/inventory/purchase-orders', { params });
    return response.data;
  }

  async getPurchaseOrder(id) {
    const response = await api.get(`/inventory/purchase-orders/${id}`);
    return response.data;
  }

  async createPurchaseOrder(data) {
    const response = await api.post('/inventory/purchase-orders', data);
    return response.data;
  }

  async updatePurchaseOrderStatus(id, data) {
    const response = await api.patch(`/inventory/purchase-orders/${id}/status`, data);
    return response.data;
  }

  async receivePurchaseOrderItems(poId, data) {
    const response = await api.post(`/inventory/purchase-orders/${poId}/receive`, data);
    return response.data;
  }

  async cancelPurchaseOrder(id) {
    const response = await api.patch(`/inventory/purchase-orders/${id}/cancel`);
    return response.data;
  }

  // ===== STOCK ADJUSTMENTS =====
  async listAdjustments(params = {}) {
    const response = await api.get('/inventory/adjustments', { params });
    return response.data;
  }

  async getAdjustment(id) {
    const response = await api.get(`/inventory/adjustments/${id}`);
    return response.data;
  }

  async createAdjustment(data) {
    const response = await api.post('/inventory/adjustments', data);
    return response.data;
  }

  // ===== REQUESTS =====
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

  // ===== CATEGORIES =====
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

  // ===== STOCK OPERATIONS =====
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

  // ===== REPORTS =====
  async generateReport(data) {
    const response = await api.post('/inventory/reports/generate', data);
    return response.data;
  }

  async listReports(params = {}) {
    const response = await api.get('/inventory/reports', { params });
    return response.data;
  }

  async getReport(id) {
    const response = await api.get(`/inventory/reports/${id}`);
    return response.data;
  }

  async getStockBalanceReport() {
    const response = await api.get('/inventory/reports/balance/summary');
    return response.data;
  }
}

const inventoryService = new InventoryService();
export default inventoryService;
