// controllers/inventoryRequestController.js
const { InventoryRequest, InventoryItem, Employee, sequelize } = require('../model');
const { Op } = require('sequelize');

const inventoryRequestController = {
  // Create a new request (any authenticated employee)
  async createRequest(req, res) {
    try {
      const { item_id, quantity_requested, reason } = req.body;
      if (!item_id || !quantity_requested) {
        return res.status(400).json({ success: false, message: 'item_id and quantity_requested are required' });
      }

      const requester_id = req.employee?.emp_id;
      const request = await InventoryRequest.create({ item_id, quantity_requested, reason, requester_id });
      return res.status(201).json({ success: true, data: request });
    } catch (error) {
      console.error('Error creating inventory request', error);
      return res.status(500).json({ success: false, message: 'Failed to create request', error: error.message });
    }
  },

  // List requests (optionally filter by status, requester_id)
  async listRequests(req, res) {
    try {
      const { page = 1, limit = 50, status, requester_id, item_id, q } = req.query;
      const offset = (page - 1) * limit;
      const where = {};
      if (status) where.status = status;
      if (requester_id) where.requester_id = requester_id;
      if (item_id) where.item_id = item_id;
      if (q) where.reason = { [Op.like]: `%${q}%` };

      const { count, rows } = await InventoryRequest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: InventoryItem, attributes: ['item_id','name','stock_keeping_unit'] },
          { model: Employee, as: 'requester', attributes: ['emp_id','emp_name'] },
          { model: Employee, as: 'approver', attributes: ['emp_id','emp_name'] }
        ],
        order: [['request_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing inventory requests', error);
      return res.status(500).json({ success: false, message: 'Failed to list requests', error: error.message });
    }
  },

  // Get single request
  async getRequest(req, res) {
    try {
      const { id } = req.params;
      const request = await InventoryRequest.findByPk(id, {
        include: [
          { model: InventoryItem, attributes: ['item_id','name','stock_keeping_unit','quantity'] },
          { model: Employee, as: 'requester', attributes: ['emp_id','emp_name'] },
          { model: Employee, as: 'approver', attributes: ['emp_id','emp_name'] }
        ]
      });
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
      return res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error('Error fetching request', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch request', error: error.message });
    }
  },

  // Approve request (admin or stock_manager)
  async approveRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const request = await InventoryRequest.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!request) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      if (request.status !== 'pending') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
      }

      const item = await InventoryItem.findByPk(request.item_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!item) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      if (item.quantity < request.quantity_requested) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient stock to fulfill request' });
      }

      // Decrement stock
      item.quantity = item.quantity - request.quantity_requested;
      await item.save({ transaction: t });

      // Update request
      request.status = 'approved';
      request.quantity_approved = request.quantity_requested;
      request.approved_by = req.employee?.emp_id || null;
      request.approved_at = new Date();
      await request.save({ transaction: t });

      await t.commit();
      return res.status(200).json({ success: true, data: { request, item } });
    } catch (error) {
      await t.rollback();
      console.error('Error approving request', error);
      return res.status(500).json({ success: false, message: 'Failed to approve request', error: error.message });
    }
  },

  // Reject request (admin or stock_manager)
  async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const request = await InventoryRequest.findByPk(id);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
      if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });

      request.status = 'rejected';
      request.approved_by = req.employee?.emp_id || null;
      request.approved_at = new Date();
      request.reason = reason || request.reason;
      await request.save();

      return res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error('Error rejecting request', error);
      return res.status(500).json({ success: false, message: 'Failed to reject request', error: error.message });
    }
  }
};

module.exports = inventoryRequestController;
