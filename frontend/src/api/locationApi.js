// src/api/locationApi.js
import api from './api';

const locationApi = {
  getLocations: (params) => api.get('/inventory/locations', { params }),
  getLocation: (id) => api.get(`/inventory/locations/${id}`),
  getItemsInLocation: (locationId, params) => api.get(`/inventory/locations/${locationId}/items`, { params }),
  createLocation: (data) => api.post('/inventory/locations', data),
  updateLocation: (id, data) => api.put(`/inventory/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/inventory/locations/${id}`),
  addItemToLocation: (data) => api.post('/inventory/locations/item-mapping/add', data),
  removeItemFromLocation: (itemLocationId) => api.delete(`/inventory/locations/item-mapping/${itemLocationId}`),
};

export default locationApi;
