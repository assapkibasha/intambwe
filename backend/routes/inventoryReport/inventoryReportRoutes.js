// routes/inventoryReport/inventoryReportRoutes.js
const express = require('express');
const router = express.Router();
const inventoryReportController = require('../../controllers/inventoryReportController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// Generate report
router.post('/generate', authenticateToken, authorizeRoles('admin','stock_manager','accountant'), inventoryReportController.generateReport);

// List reports
router.get('/', authenticateToken, inventoryReportController.listReports);

// Get report
router.get('/:id', authenticateToken, inventoryReportController.getReport);

// Get stock balance report
router.get('/balance/summary', authenticateToken, inventoryReportController.getStockBalanceReport);

module.exports = router;
