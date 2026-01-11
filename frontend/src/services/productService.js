import api from '../api/api';

class ProductService {
  async createProduct(data) {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create product';
      throw new Error(msg);
    }
  }

  async getAllProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load products';
      throw new Error(msg);
    }
  }

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load product';
      throw new Error(msg);
    }
  }

  async updateProduct(id, data) {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update product';
      throw new Error(msg);
    }
  }

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to delete product';
      throw new Error(msg);
    }
  }
}

const productService = new ProductService();
export default productService;
