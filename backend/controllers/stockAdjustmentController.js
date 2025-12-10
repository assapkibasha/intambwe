// controllers/stockAdjustmentController.js
const { StockAdjustment, InventoryItem, Employee, sequelize } = require('../model');
const { Op } = require('sequelize');

const stockAdjustmentController = {
  // Create stock adjustment
  async createAdjustment(req, res) {
    const t = await sequelize.transaction();
    try {
      const { item_id, adjustment_type, quantity, reason, reference_number } = req.body;
      if (!item_id || !adjustment_type || quantity === undefined) {
        return res.status(400).json({ success: false, message: 'item_id, adjustment_type, and quantity are required' });
      }

      // Update inventory item quantity
      const item = await InventoryItem.findByPk(item_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!item) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      item.quantity = item.quantity - Number(quantity);
      if (item.quantity < 0) item.quantity = 0;
      await item.save({ transaction: t });

      // Create adjustment record
      const adjustment = await StockAdjustment.create({
        item_id,
        adjustment_type,
        quantity,
        reason,
        reference_number,
        adjusted_by: req.employee?.emp_id || null
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ success: true, data: adjustment, message: 'Stock adjustment recorded' });
    } catch (error) {
      await t.rollback();
      console.error('Error creating adjustment', error);
      return res.status(500).json({ success: false, message: 'Failed to create adjustment', error: error.message });
    }
  },

  // List adjustments
  async listAdjustments(req, res) {
    try {
      const { page = 1, limit = 50, item_id, adjustment_type } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (item_id) where.item_id = item_id;
      if (adjustment_type) where.adjustment_type = adjustment_type;

      const { count, rows } = await StockAdjustment.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: InventoryItem, attributes: ['item_id', 'name', 'stock_keeping_unit'] },
          { model: Employee, as: 'adjustedBy', attributes: ['emp_id', 'emp_name'] }
        ],
        order: [['adjustment_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing adjustments', error);
      return res.status(500).json({ success: false, message: 'Failed to list adjustments', error: error.message });
    }
  },

  // Get adjustment
  async getAdjustment(req, res) {
    try {
      const { id } = req.params;
      const adjustment = await StockAdjustment.findByPk(id, {
        include: [
          { model: InventoryItem, attributes: ['item_id', 'name', 'stock_keeping_unit', 'quantity'] },
          { model: Employee, as: 'adjustedBy', attributes: ['emp_id', 'emp_name'] }
        ]
      });
      if (!adjustment) return res.status(404).json({ success: false, message: 'Adjustment not found' });
      return res.status(200).json({ success: true, data: adjustment });
    } catch (error) {
      console.error('Error fetching adjustment', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch adjustment', error: error.message });
    }
  }
};

module.exports = stockAdjustmentController;
