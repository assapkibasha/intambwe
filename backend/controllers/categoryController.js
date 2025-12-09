// controllers/categoryController.js
const { Category } = require('../model');

const categoryController = {
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
      const cat = await Category.create({ name, description });
      return res.status(201).json({ success: true, data: cat });
    } catch (error) {
      console.error('Error creating category', error);
      return res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
    }
  },

  async listCategories(req, res) {
    try {
      const cats = await Category.findAll({ order: [['name','ASC']] });
      return res.status(200).json({ success: true, data: cats });
    } catch (error) {
      console.error('Error listing categories', error);
      return res.status(500).json({ success: false, message: 'Failed to list categories', error: error.message });
    }
  },

  async getCategory(req, res) {
    try {
      const { id } = req.params;
      const cat = await Category.findByPk(id);
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.status(200).json({ success: true, data: cat });
    } catch (error) {
      console.error('Error fetching category', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const cat = await Category.findByPk(id);
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
      await cat.update(req.body);
      return res.status(200).json({ success: true, data: cat });
    } catch (error) {
      console.error('Error updating category', error);
      return res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const cat = await Category.findByPk(id);
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
      await cat.destroy();
      return res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      console.error('Error deleting category', error);
      return res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
    }
  }
};

module.exports = categoryController;
