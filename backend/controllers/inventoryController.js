// controllers/inventoryController.js
const { InventoryItem, Employee, Category, Supplier, InventoryLocation, ItemLocation, sequelize } = require('../model');
const { Op } = require('sequelize');

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

  // List items with optional pagination and filters
  async listItems(req, res) {
    try {
      const { page = 1, limit = 50, q, category_id, supplier_id, status } = req.query;
      const offset = (page - 1) * limit;
      const where = {};
      
      if (q) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { stock_keeping_unit: { [Op.like]: `%${q}%` } },
          { barcode: { [Op.like]: `%${q}%` } }
        ];
      }
      if (category_id) where.category_id = category_id;
      if (supplier_id) where.supplier_id = supplier_id;
      if (status) where.status = status;

      const { count, rows } = await InventoryItem.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: Employee, as: 'addedBy', attributes: ['emp_id','emp_name'] },
          { model: Category, as: 'category', attributes: ['category_id', 'name'] },
          { model: Supplier, attributes: ['supplier_id', 'name'] }
        ],
        order: [['item_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing items', error);
      return res.status(500).json({ success: false, message: 'Failed to list items', error: error.message });
    }
  },

  // Get single item with detailed information
  async getItem(req, res) {
    try {
      const { id } = req.params;
      const item = await InventoryItem.findByPk(id, { 
        include: [
          { model: Employee, as: 'addedBy', attributes: ['emp_id','emp_name'] },
          { model: Category, as: 'category', attributes: ['category_id', 'name'] },
          { model: Supplier, attributes: ['supplier_id', 'name', 'contact_person', 'email', 'phone'] }
        ] 
      });
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error('Error fetching item', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch item', error: error.message });
    }
  },

  // Get items by location
  async getItemsByLocation(req, res) {
    try {
      const { location_id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await ItemLocation.findAndCountAll({
        where: { location_id: parseInt(location_id) },
        include: [
          { 
            model: InventoryItem, 
            attributes: ['item_id', 'name', 'stock_keeping_unit', 'quantity', 'unit_type']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['item_location_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error fetching items by location', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch items', error: error.message });
    }
  },

  // Get low stock items
  async getLowStockItems(req, res) {
    try {
      const { limit = 100 } = req.query;
      const items = await InventoryItem.findAll({
        where: {
          quantity: { [Op.lt]: sequelize.col('minimum_stock_level') },
          status: 'active'
        },
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
          { model: Supplier, attributes: ['name'] }
        ],
        limit: parseInt(limit),
        order: [['quantity', 'ASC']]
      });
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching low stock items', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch low stock items', error: error.message });
    }
  },

  // Get expired items
  async getExpiredItems(req, res) {
    try {
      const { limit = 100 } = req.query;
      const items = await InventoryItem.findAll({
        where: {
          expiry_date: { [Op.lt]: new Date() },
          status: 'active'
        },
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
          { model: Supplier, attributes: ['name'] }
        ],
        limit: parseInt(limit),
        order: [['expiry_date', 'ASC']]
      });
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching expired items', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch expired items', error: error.message });
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
      updateData.updated_at = new Date();

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
      return res.status(200).json({ success: true, message: 'Item deleted from inventory items' });
    } catch (error) {
      console.error('Error deleting item', error);
      return res.status(500).json({ success: false, message: 'Failed to delete item', error: error.message });
    }
  },

  // Get inventory statistics
  async getInventoryStats(req, res) {
    try {
      const totalItems = await InventoryItem.count();
      const activeItems = await InventoryItem.count({ where: { status: 'active' } });
      const lowStockItems = await InventoryItem.count({
        where: {
          quantity: { [Op.lt]: sequelize.col('minimum_stock_level') },
          status: 'active'
        }
      });
      const expiredItems = await InventoryItem.count({
        where: {
          expiry_date: { [Op.lt]: new Date() },
          status: 'active'
        }
      });

      const stats = {
        totalItems,
        activeItems,
        lowStockItems,
        expiredItems,
        outOfStockItems: await InventoryItem.count({ where: { quantity: 0, status: 'active' } })
      };

      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching inventory stats', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch inventory stats', error: error.message });
    }
  }
};

module.exports = inventoryController;
