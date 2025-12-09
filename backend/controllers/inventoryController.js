// controllers/inventoryController.js
const { InventoryItem, Employee } = require('../model');

const inventoryController = {
  // Create item
  async createItem(req, res) {
    try {
      const data = req.body;
      // support legacy `sku` field by mapping to `stock_keeping_unit`
      if (data.sku && !data.stock_keeping_unit) {
        data.stock_keeping_unit = data.sku;
        delete data.sku;
      }
      data.added_by = req.employee?.emp_id || data.added_by || null;

      const item = await InventoryItem.create(data);
      return res.status(201).json({ success: true, data: item });
    } catch (error) {
      console.error('Error creating inventory item', error);
      return res.status(500).json({ success: false, message: 'Failed to create item', error: error.message });
    }
  },

  // List items with optional pagination
  async listItems(req, res) {
    try {
      const { page = 1, limit = 50, q } = req.query;
      const offset = (page - 1) * limit;
      const where = {};
      if (q) {
        where.name = { [require('sequelize').Op.like]: `%${q}%` };
      }

      const { count, rows } = await InventoryItem.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{ model: Employee, as: 'addedBy', attributes: ['emp_id','emp_name'] }],
        order: [['item_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing items', error);
      return res.status(500).json({ success: false, message: 'Failed to list items', error: error.message });
    }
  },

  // Get single item
  async getItem(req, res) {
    try {
      const { id } = req.params;
      const item = await InventoryItem.findByPk(id, { include: [{ model: Employee, as: 'addedBy', attributes: ['emp_id','emp_name'] }] });
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error('Error fetching item', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch item', error: error.message });
    }
  },

  // Update item
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const item = await InventoryItem.findByPk(id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      // support legacy `sku` field on update
      const updateData = { ...req.body };
      if (updateData.sku && !updateData.stock_keeping_unit) {
        updateData.stock_keeping_unit = updateData.sku;
        delete updateData.sku;
      }

      await item.update(updateData);
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error('Error updating item', error);
      return res.status(500).json({ success: false, message: 'Failed to update item', error: error.message });
    }
  },

  // Delete item
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const item = await InventoryItem.findByPk(id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found in inventory items!' });

      await item.destroy();
      return res.status(200).json({ success: true, message: 'Item deleted from inventory Itemes' });
    } catch (error) {
      console.error('Error deleting item', error);
      return res.status(500).json({ success: false, message: 'Failed to delete item', error: error.message });
    }
  }
};

module.exports = inventoryController;
