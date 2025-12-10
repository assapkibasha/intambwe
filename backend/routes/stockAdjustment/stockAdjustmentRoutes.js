// routes/stockAdjustment/stockAdjustmentRoutes.js
const express = require('express');
const router = express.Router();
const stockAdjustmentController = require('../../controllers/stockAdjustmentController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// List adjustments
router.get('/', authenticateToken, stockAdjustmentController.listAdjustments);

// Get adjustment
router.get('/:id', authenticateToken, stockAdjustmentController.getAdjustment);

// Create adjustment (admin/stock manager)
router.post('/', authenticateToken, authorizeRoles('admin','stock_manager'), stockAdjustmentController.createAdjustment);

module.exports = router;
