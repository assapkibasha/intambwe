// routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken, authorizeRoles } = require('../middleware/employeeAuth');

router.post('/in', authenticateToken, authorizeRoles('admin','stock_manager'), stockController.stockIn);
router.post('/out', authenticateToken, authorizeRoles('admin','stock_manager'), stockController.stockOut);
router.get('/transactions', authenticateToken, stockController.listTransactions);

module.exports = router;
