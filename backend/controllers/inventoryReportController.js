// controllers/inventoryReportController.js
const { InventoryReport, InventoryItem, StockTransaction, StockAdjustment, Employee, Category, sequelize } = require('../model');
const { Op } = require('sequelize');

const inventoryReportController = {
  // Generate inventory report
  async generateReport(req, res) {
    try {
      const { report_type = 'daily', start_date, end_date } = req.body;

      // Get inventory snapshot
      const items = await InventoryItem.findAll({
        include: [
          { model: Category, attributes: ['category_id', 'name'] }
        ],
        raw: false
      });

      // Calculate statistics
      const totalItems = items.length;
      const lowStockItems = items.filter(i => i.quantity <= (i.minimum_stock_level || 10)).length;
      const expiredItems = items.filter(i => i.expiry_date && new Date(i.expiry_date) <= new Date()).length;
      
      let totalValue = 0;
      const categoryBreakdown = {};
      
      items.forEach(item => {
        totalValue += (item.quantity * (item.unit_price || 0));
        const catName = item.Category?.name || 'Uncategorized';
        if (!categoryBreakdown[catName]) {
          categoryBreakdown[catName] = { count: 0, value: 0 };
        }
        categoryBreakdown[catName].count++;
        categoryBreakdown[catName].value += (item.quantity * (item.unit_price || 0));
      });

      // Get transactions for the period
      const transWhere = {};
      if (start_date || end_date) {
        transWhere.created_at = {};
        if (start_date) transWhere.created_at[Op.gte] = new Date(start_date);
        if (end_date) transWhere.created_at[Op.lte] = new Date(end_date);
      }

      const transactions = await StockTransaction.findAll({ where: transWhere });
      const adjustments = await StockAdjustment.findAll({ where: transWhere });

      const report = await InventoryReport.create({
        report_type,
        report_date: new Date(),
        total_items: totalItems,
        total_value: totalValue,
        low_stock_items_count: lowStockItems,
        report_data: {
          categoryBreakdown,
          expiredItems,
          transactionCount: transactions.length,
          adjustmentCount: adjustments.length,
          items: items.map(i => ({
            id: i.item_id,
            name: i.name,
            quantity: i.quantity,
            value: i.quantity * (i.unit_price || 0),
            status: i.quantity <= (i.minimum_stock_level || 10) ? 'low_stock' : 'normal'
          }))
        },
        generated_by: req.employee?.emp_id || null
      });

      return res.status(201).json({ success: true, data: report, message: 'Report generated successfully' });
    } catch (error) {
      console.error('Error generating report', error);
      return res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  },

  // List reports
  async listReports(req, res) {
    try {
      const { page = 1, limit = 50, report_type } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (report_type) where.report_type = report_type;

      const { count, rows } = await InventoryReport.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: Employee, as: 'generatedBy', attributes: ['emp_id', 'emp_name'] }
        ],
        order: [['report_id','DESC']]
      });

      return res.status(200).json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      console.error('Error listing reports', error);
      return res.status(500).json({ success: false, message: 'Failed to list reports', error: error.message });
    }
  },

  // Get report
  async getReport(req, res) {
    try {
      const { id } = req.params;
      const report = await InventoryReport.findByPk(id, {
        include: [
          { model: Employee, as: 'generatedBy', attributes: ['emp_id', 'emp_name'] }
        ]
      });
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error fetching report', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch report', error: error.message });
    }
  },

  // Get stock balance report
  async getStockBalanceReport(req, res) {
    try {
      const items = await InventoryItem.findAll({
        include: [
          { model: Category, attributes: ['category_id', 'name'] },
          { model: Supplier, attributes: ['supplier_id', 'name'] }
        ],
        order: [['name','ASC']]
      });

      const balanceReport = items.map(item => ({
        itemId: item.item_id,
        name: item.name,
        sku: item.stock_keeping_unit,
        quantity: item.quantity,
        minimumLevel: item.minimum_stock_level,
        status: item.quantity <= (item.minimum_stock_level || 10) ? 'Low Stock' : 'In Stock',
        unitPrice: item.unit_price,
        totalValue: item.quantity * (item.unit_price || 0),
        category: item.Category?.name,
        supplier: item.Supplier?.name
      }));

      const summary = {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
        totalValue: items.reduce((sum, i) => sum + (i.quantity * (i.unit_price || 0)), 0),
        lowStockCount: items.filter(i => i.quantity <= (i.minimum_stock_level || 10)).length
      };

      return res.status(200).json({ success: true, data: balanceReport, summary });
    } catch (error) {
      console.error('Error generating stock balance report', error);
      return res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  }
};

module.exports = inventoryReportController;
