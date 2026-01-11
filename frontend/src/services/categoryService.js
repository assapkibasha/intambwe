import api from '../api/api';

class CategoryService {
  async createCategory(data) {
    try {
      const response = await api.post('/categories', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create category';
      throw new Error(msg);
    }
  }

  async getAllCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load categories';
      throw new Error(msg);
    }
  }

  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load category';
      throw new Error(msg);
    }
  }

  async updateCategory(id, data) {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to update category';
      throw new Error(msg);
    }
  }

  async deleteCategory(id) {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to delete category';
      throw new Error(msg);
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
