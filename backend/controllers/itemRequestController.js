const { ItemRequest, InventoryItem, Employee, sequelize } = require('../model');
const { Op } = require('sequelize');

const itemRequestController = {
  // ============================================
  // CREATE REQUEST (Any authenticated employee)
  // ============================================
  async createRequest(req, res) {
    try {
      const { item_id, quantity_requested, reason } = req.body;
      
      // Validation
      if (!item_id || !quantity_requested) {
        return res.status(400).json({ 
          success: false, 
          message: 'item_id and quantity_requested are required' 
        });
      }

      const requester_id = req.employee?.emp_id;
      const request = await ItemRequest.create({ 
        item_id, 
        quantity_requested, 
        reason, 
        requester_id,
        status: 'pending'
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Item request created successfully',
        data: request 
      });
    } catch (error) {
      console.error('Error creating item request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // LIST REQUESTS (with filtering & pagination)
  // ============================================
  async listRequests(req, res) {
    try {
      const { page = 1, limit = 50, status, requester_id, item_id, q } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;
      if (requester_id) where.requester_id = requester_id;
      if (item_id) where.item_id = item_id;
      if (q) where.reason = { [Op.like]: `%${q}%` };

      const { count, rows } = await ItemRequest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { 
            model: InventoryItem, 
            attributes: ['item_id', 'name', 'sku', 'quantity_on_hand'] 
          },
          { 
            model: Employee, 
            as: 'requester', 
            attributes: ['emp_id', 'emp_name', 'emp_email'] 
          },
          { 
            model: Employee, 
            as: 'approver', 
            attributes: ['emp_id', 'emp_name'] 
          }
        ],
        order: [['request_id', 'DESC']]
      });

      return res.status(200).json({ 
        success: true, 
        data: rows, 
        pagination: { 
          total: count, 
          page: parseInt(page), 
          limit: parseInt(limit) 
        } 
      });
    } catch (error) {
      console.error('Error listing item requests:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to list requests', 
        error: error.message 
      });
    }
  },

  // ============================================
  // GET SINGLE REQUEST
  // ============================================
  async getRequest(req, res) {
    try {
      const { id } = req.params;
      const request = await ItemRequest.findByPk(id, {
        include: [
          { 
            model: InventoryItem, 
            attributes: ['item_id', 'name', 'sku', 'quantity_on_hand'] 
          },
          { 
            model: Employee, 
            as: 'requester', 
            attributes: ['emp_id', 'emp_name', 'emp_email'] 
          },
          { 
            model: Employee, 
            as: 'approver', 
            attributes: ['emp_id', 'emp_name'] 
          }
        ]
      });

      if (!request) {
        return res.status(404).json({ 
          success: false, 
          message: 'Request not found' 
        });
      }

      return res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error('Error fetching request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // GET MY REQUESTS (Employee's own requests)
  // ============================================
  async getMyRequests(req, res) {
    try {
      const requester_id = req.employee?.emp_id;

      const requests = await ItemRequest.findAll({
        where: { requester_id },
        include: [
          { 
            model: InventoryItem, 
            attributes: ['item_id', 'name', 'sku', 'quantity_on_hand'] 
          },
          { 
            model: Employee, 
            as: 'approver', 
            attributes: ['emp_id', 'emp_name'] 
          }
        ],
        order: [['request_id', 'DESC']]
      });

      return res.status(200).json({ 
        success: true, 
        data: requests 
      });
    } catch (error) {
      console.error('Error fetching employee requests:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch requests', 
        error: error.message 
      });
    }
  },

  // ============================================
  // GET PENDING REQUESTS (For approval dashboard)
  // ============================================
  async getPendingRequests(req, res) {
    try {
      const requests = await ItemRequest.findAll({
        where: { status: 'pending' },
        include: [
          { 
            model: Employee, 
            as: 'requester', 
            attributes: ['emp_id', 'emp_name', 'emp_email'] 
          },
          { 
            model: InventoryItem, 
            attributes: ['item_id', 'name', 'sku', 'quantity_on_hand'] 
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return res.status(200).json({ 
        success: true, 
        data: requests 
      });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch pending requests', 
        error: error.message 
      });
    }
  },

  // ============================================
  // APPROVE REQUEST (Admin/Stock Manager)
  // ============================================
  async approveRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { quantity_approved, approval_notes } = req.body;
      const approver_id = req.employee?.emp_id;

      const request = await ItemRequest.findByPk(id, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });

      if (!request) {
        await t.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Request not found' 
        });
      }

      if (request.status !== 'pending') {
        await t.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Request is already ${request.status}` 
        });
      }

      // Validate quantity
      const approvedQty = quantity_approved || request.quantity_requested;
      if (approvedQty > request.quantity_requested) {
        await t.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Approved quantity cannot exceed requested quantity' 
        });
      }

      // Update request
      await request.update(
        {
          status: 'approved',
          quantity_approved: approvedQty,
          approved_by: approver_id,
          approved_at: new Date(),
          approval_notes: approval_notes || null
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(200).json({ 
        success: true, 
        message: 'Request approved successfully', 
        data: request 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error approving request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to approve request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // REJECT REQUEST (Admin/Stock Manager)
  // ============================================
  async rejectRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { approval_notes } = req.body;
      const approver_id = req.employee?.emp_id;

      const request = await ItemRequest.findByPk(id, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });

      if (!request) {
        await t.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Request not found' 
        });
      }

      if (request.status !== 'pending') {
        await t.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Request is already ${request.status}` 
        });
      }

      // Update request
      await request.update(
        {
          status: 'rejected',
          approved_by: approver_id,
          approved_at: new Date(),
          approval_notes: approval_notes || null
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(200).json({ 
        success: true, 
        message: 'Request rejected successfully', 
        data: request 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error rejecting request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to reject request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // CONFIRM REQUEST (Mark as fulfilled/confirmed)
  // ============================================
  async confirmRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const confirmer_id = req.employee?.emp_id;

      const request = await ItemRequest.findByPk(id, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });

      if (!request) {
        await t.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Request not found' 
        });
      }

      if (request.status !== 'approved') {
        await t.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Only approved requests can be confirmed' 
        });
      }

      // Update request to confirmed
      await request.update(
        {
          status: 'confirmed',
          confirmed_at: new Date()
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(200).json({ 
        success: true, 
        message: 'Request confirmed/fulfilled successfully', 
        data: request 
      });
    } catch (error) {
      await t.rollback();
      console.error('Error confirming request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to confirm request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // UPDATE REQUEST (For pending requests only)
  // ============================================
  async updateRequest(req, res) {
    try {
      const { id } = req.params;
      const { quantity_requested, reason } = req.body;
      const requester_id = req.employee?.emp_id;

      const request = await ItemRequest.findByPk(id);

      if (!request) {
        return res.status(404).json({ 
          success: false, 
          message: 'Request not found' 
        });
      }

      // Only requester can update their own pending request
      if (request.requester_id !== requester_id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own requests' 
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Can only update pending requests' 
        });
      }

      // Update allowed fields
      if (quantity_requested !== undefined) request.quantity_requested = quantity_requested;
      if (reason !== undefined) request.reason = reason;

      await request.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Request updated successfully', 
        data: request 
      });
    } catch (error) {
      console.error('Error updating request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // DELETE REQUEST (For pending requests only)
  // ============================================
  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      const requester_id = req.employee?.emp_id;

      const request = await ItemRequest.findByPk(id);

      if (!request) {
        return res.status(404).json({ 
          success: false, 
          message: 'Request not found' 
        });
      }

      // Only requester can delete their own pending request
      if (request.requester_id !== requester_id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only delete your own requests' 
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Can only delete pending requests' 
        });
      }

      await request.destroy();

      return res.status(200).json({ 
        success: true, 
        message: 'Request deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting request:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete request', 
        error: error.message 
      });
    }
  },

  // ============================================
  // GET STATISTICS (For dashboard)
  // ============================================
  async getRequestStats(req, res) {
    try {
      const stats = await ItemRequest.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('*')), 'total'],
          'status'
        ],
        group: ['status'],
        raw: true
      });

      const formattedStats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        confirmed: 0
      };

      stats.forEach(stat => {
        formattedStats.total += parseInt(stat.total);
        formattedStats[stat.status] = parseInt(stat.total);
      });

      return res.status(200).json({ 
        success: true, 
        data: formattedStats 
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch statistics', 
        error: error.message 
      });
    }
  }
};

module.exports = itemRequestController;
