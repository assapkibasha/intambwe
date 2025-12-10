import api from './api';

const API_BASE = '/item-requests';

/**
 * Item Request Service
 * Handles all API calls for unified item request management
 */

// ============================================
// CREATE & UPDATE
// ============================================

export const createItemRequest = async (data) => {
  try {
    const response = await api.post(`${API_BASE}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating item request:', error);
    throw error;
  }
};

export const updateItemRequest = async (id, data) => {
  try {
    const response = await api.put(`${API_BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating item request:', error);
    throw error;
  }
};

export const deleteItemRequest = async (id) => {
  try {
    const response = await api.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting item request:', error);
    throw error;
  }
};

// ============================================
// RETRIEVE
// ============================================

export const getItemRequest = async (id) => {
  try {
    const response = await api.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item request:', error);
    throw error;
  }
};

export const getMyItemRequests = async () => {
  try {
    const response = await api.get(`${API_BASE}/me`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my item requests:', error);
    throw error;
  }
};

export const listItemRequests = async (params = {}) => {
  try {
    const response = await api.get(`${API_BASE}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error listing item requests:', error);
    throw error;
  }
};

export const getPendingItemRequests = async () => {
  try {
    const response = await api.get(`${API_BASE}/pending/list`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending item requests:', error);
    throw error;
  }
};

// ============================================
// APPROVAL ACTIONS
// ============================================

export const approveItemRequest = async (id, data) => {
  try {
    const response = await api.post(`${API_BASE}/${id}/approve`, data);
    return response.data;
  } catch (error) {
    console.error('Error approving item request:', error);
    throw error;
  }
};

export const rejectItemRequest = async (id, data) => {
  try {
    const response = await api.post(`${API_BASE}/${id}/reject`, data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting item request:', error);
    throw error;
  }
};

export const confirmItemRequest = async (id) => {
  try {
    const response = await api.post(`${API_BASE}/${id}/confirm`);
    return response.data;
  } catch (error) {
    console.error('Error confirming item request:', error);
    throw error;
  }
};

// ============================================
// STATISTICS
// ============================================

export const getItemRequestStats = async () => {
  try {
    const response = await api.get(`${API_BASE}/stats/overview`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item request statistics:', error);
    throw error;
  }
};

export default {
  createItemRequest,
  updateItemRequest,
  deleteItemRequest,
  getItemRequest,
  getMyItemRequests,
  listItemRequests,
  getPendingItemRequests,
  approveItemRequest,
  rejectItemRequest,
  confirmItemRequest,
  getItemRequestStats,
};
