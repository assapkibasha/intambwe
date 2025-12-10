// controllers/purchaseOrderController.js
const { PurchaseOrder, PurchaseOrderItem, Supplier, InventoryItem, Employee, sequelize } = require('../model');
const { Op } = require('sequelize');

const purchaseOrderController = {
  // Create purchase order
  async createPurchaseOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const { supplier_id, expected_delivery_date, notes, items } = req.body;
      if (!supplier_id || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'supplier_id and items array are required' });
      }

      // Generate PO number
      const count = await PurchaseOrder.count();
      const po_number = `PO-${Date.now()}-${count + 1}`;

      let total_amount = 0;
      const poItems = [];
      for (const item of items) {
        const lineTotal = (item.unit_price || 0) * (item.quantity_ordered || 0);
        total_amount += lineTotal;
        poItems.push({
          ...item,
          line_total: lineTotal
        });
      }

      const po = await PurchaseOrder.create({
        po_number,
        supplier_id,
        expected_delivery_date,
        notes,
        total_amount,
        created_by: req.employee?.emp_id || null
      }, { transaction: t });

      // Create PO items
      for (const poItem of poItems) {
        await PurchaseOrderItem.create({
          po_id: po.po_id,
          item_id: poItem.item_id,
          quantity_ordered: poItem.quantity_ordered,
          unit_price: poItem.unit_price
        }, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ success: true, data: po, message: 'Purchase order created successfully' });
    } catch (error) {
      await t.rollback();
      console.error('Error creating purchase order', error);
      return res.status(500).json({ success: false, message: 'Failed to create purchase order', error: error.message });
    }
  },

  // List purchase orders
  async listPurchaseOrders(req, res) {
    try {
      const { page = 1, limit = 50, supplier_id, status, q } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (supplier_id) where.supplier_id = supplier_id;
      if (status) where.status = status;
      if (q) where.po_number = { [Op.like]: `%${q}%` };

      const { count, rows } = await PurchaseOrder.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: Supplier, attributes: ['supplier_id', 'name', 'contact_person'] },
          { model: Employee, as: 'createdBy', attributes: ['emp_id', 'emp_name'] }
        ],
        order: [['po_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing purchase orders', error);
      return res.status(500).json({ success: false, message: 'Failed to list purchase orders', error: error.message });
    }
  },

  // Get purchase order with items
  async getPurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const po = await PurchaseOrder.findByPk(id, {
        include: [
          { model: Supplier, attributes: ['supplier_id', 'name', 'contact_person', 'email', 'phone'] },
          { 
            model: PurchaseOrderItem, 
            include: [{ model: InventoryItem, attributes: ['item_id', 'name', 'stock_keeping_unit'] }]
          },
          { model: Employee, as: 'createdBy', attributes: ['emp_id', 'emp_name'] }
        ]
      });
      if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });
      return res.status(200).json({ success: true, data: po });
    } catch (error) {
      console.error('Error fetching purchase order', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch purchase order', error: error.message });
    }
  },

  // Update purchase order status
  async updatePurchaseOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, actual_delivery_date } = req.body;

      const po = await PurchaseOrder.findByPk(id);
      if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

      po.status = status;
      if (actual_delivery_date && status === 'received') {
        po.actual_delivery_date = actual_delivery_date;
      }
      await po.save();

      return res.status(200).json({ success: true, data: po });
    } catch (error) {
      console.error('Error updating purchase order', error);
      return res.status(500).json({ success: false, message: 'Failed to update purchase order', error: error.message });
    }
  },

  // Receive purchase order items
  async receivePurchaseOrderItems(req, res) {
    const t = await sequelize.transaction();
    try {
      const { po_id, items } = req.body;
      if (!po_id || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'po_id and items array are required' });
      }

      const po = await PurchaseOrder.findByPk(po_id, { transaction: t });
      if (!po) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      // Update received quantities
      for (const item of items) {
        const poItem = await PurchaseOrderItem.findByPk(item.po_item_id, { transaction: t });
        if (poItem) {
          poItem.quantity_received = (poItem.quantity_received || 0) + (item.quantity_received || 0);
          await poItem.save({ transaction: t });

          // Update inventory
          const invItem = await InventoryItem.findByPk(poItem.item_id, { transaction: t, lock: t.LOCK.UPDATE });
          if (invItem) {
            invItem.quantity = (invItem.quantity || 0) + (item.quantity_received || 0);
            await invItem.save({ transaction: t });
          }
        }
      }

      // Check if all items are received
      const poItems = await PurchaseOrderItem.findAll({ where: { po_id }, transaction: t });
      const allReceived = poItems.every(pi => pi.quantity_received >= pi.quantity_ordered);
      
      if (allReceived) {
        po.status = 'received';
      } else {
        po.status = 'partially_received';
      }
      await po.save({ transaction: t });

      await t.commit();
      return res.status(200).json({ success: true, data: po, message: 'Items received successfully' });
    } catch (error) {
      await t.rollback();
      console.error('Error receiving items', error);
      return res.status(500).json({ success: false, message: 'Failed to receive items', error: error.message });
    }
  },

  // Cancel purchase order
  async cancelPurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const po = await PurchaseOrder.findByPk(id);
      if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

      po.status = 'cancelled';
      await po.save();

      return res.status(200).json({ success: true, data: po, message: 'Purchase order cancelled' });
    } catch (error) {
      console.error('Error cancelling purchase order', error);
      return res.status(500).json({ success: false, message: 'Failed to cancel purchase order', error: error.message });
    }
  }
};

module.exports = purchaseOrderController;
