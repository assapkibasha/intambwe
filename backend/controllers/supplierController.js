// controllers/supplierController.js
const { Supplier, Employee } = require('../model');
const { Op } = require('sequelize');

const supplierController = {
  // Create supplier
  async createSupplier(req, res) {
    try {
      const data = req.body;
      data.created_by = req.employee?.emp_id || null;

      const supplier = await Supplier.create(data);
      return res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      console.error('Error creating supplier', error);
      return res.status(500).json({ success: false, message: 'Failed to create supplier', error: error.message });
    }
  },

  // List suppliers
  async listSuppliers(req, res) {
    try {
      const { page = 1, limit = 50, q, status } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (q) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { contact_person: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ];
      }
      if (status) where.status = status;

      const { count, rows } = await Supplier.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{ model: Employee, as: 'createdBy', attributes: ['emp_id', 'emp_name'] }],
        order: [['supplier_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing suppliers', error);
      return res.status(500).json({ success: false, message: 'Failed to list suppliers', error: error.message });
    }
  },

  // Get supplier
  async getSupplier(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id, {
        include: [{ model: Employee, as: 'createdBy', attributes: ['emp_id', 'emp_name'] }]
      });
      if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
      return res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      console.error('Error fetching supplier', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch supplier', error: error.message });
    }
  },

  // Update supplier
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);
      if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

      await supplier.update(req.body);
      return res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      console.error('Error updating supplier', error);
      return res.status(500).json({ success: false, message: 'Failed to update supplier', error: error.message });
    }
  },

  // Delete supplier
  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);
      if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

      await supplier.destroy();
      return res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
      console.error('Error deleting supplier', error);
      return res.status(500).json({ success: false, message: 'Failed to delete supplier', error: error.message });
    }
  }
};

module.exports = supplierController;
