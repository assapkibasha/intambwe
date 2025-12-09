// controllers/stockController.js
const { InventoryItem, StockTransaction, sequelize } = require('../model');

const stockController = {
  // Stock in: increase quantity and record transaction
  async stockIn(req, res) {
    const t = await sequelize.transaction();
    try {
      const { item_id, quantity, reference, note } = req.body;
      if (!item_id || !quantity) return res.status(400).json({ success: false, message: 'item_id and quantity are required' });

      const item = await InventoryItem.findByPk(item_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!item) { await t.rollback(); return res.status(404).json({ success: false, message: 'Item not found' }); }

      item.quantity = item.quantity + Number(quantity);
      await item.save({ transaction: t });

      const tx = await StockTransaction.create({ item_id, type: 'in', quantity: Number(quantity), performed_by: req.employee?.emp_id || null, reference, note }, { transaction: t });

      await t.commit();
      return res.status(201).json({ success: true, data: { transaction: tx, item } });
    } catch (error) {
      await t.rollback();
      console.error('Error in stockIn', error);
      return res.status(500).json({ success: false, message: 'Failed to perform stock in', error: error.message });
    }
  },

  // Stock out: decrease quantity and record transaction
  async stockOut(req, res) {
    const t = await sequelize.transaction();
    try {
      const { item_id, quantity, reference, note } = req.body;
      if (!item_id || !quantity) return res.status(400).json({ success: false, message: 'item_id and quantity are required' });

      const item = await InventoryItem.findByPk(item_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!item) { await t.rollback(); return res.status(404).json({ success: false, message: 'Item not found' }); }

      if (item.quantity < Number(quantity)) { await t.rollback(); return res.status(400).json({ success: false, message: 'Insufficient stock' }); }

      item.quantity = item.quantity - Number(quantity);
      await item.save({ transaction: t });

      const tx = await StockTransaction.create({ item_id, type: 'out', quantity: Number(quantity), performed_by: req.employee?.emp_id || null, reference, note }, { transaction: t });

      await t.commit();
      return res.status(201).json({ success: true, data: { transaction: tx, item } });
    } catch (error) {
      await t.rollback();
      console.error('Error in stockOut', error);
      return res.status(500).json({ success: false, message: 'Failed to perform stock out', error: error.message });
    }
  },

  // List transactions
  async listTransactions(req, res) {
    try {
      const { page = 1, limit = 50, item_id } = req.query;
      const offset = (page - 1) * limit;
      const where = {};
      if (item_id) where.item_id = item_id;

      const { count, rows } = await StockTransaction.findAndCountAll({ where, limit: parseInt(limit), offset: parseInt(offset), order: [['transaction_id','DESC']] });
      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing transactions', error);
      return res.status(500).json({ success: false, message: 'Failed to list transactions', error: error.message });
    }
  }
};

module.exports = stockController;
