// routes/inventory/stockTransactionRoutes.js

const express = require('express');
const router = express.Router();

const stockTransactionController = require('../../controllers/invetory/StockTransactionController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// --- Stock Transaction Routes (Ledger/Audit Trail) ---

// GET: List all Stock Transactions (Read-only access for auditors/managers)
router.get(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockTransactionController.listStockTransactions
);

// GET: Get a specific Stock Transaction by ID
router.get(
    '/:id', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockTransactionController.getStockTransactionById
);

module.exports = router;