// routes/inventory/stockInRoutes.js

const express = require('express');
const router = express.Router();

// Import the required controllers
const stockInController = require('../../controllers/stockIn/stockInController');
const stockDetailController = require('../../controllers/stockIn/stockDetailController');

// Import your existing middleware
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// --- 1. StockIn (Header Document) Routes ---

// POST: Create a new StockIn (Receipt Header) - Status will be 'draft' initially
router.post(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockInController.createStockIn
);

// GET: List all StockIn documents, GET, PUT on specific document
router.route('/:id')
    .get(authenticateToken, authorizeRoles('admin', 'stock_manager', 'employee'), stockInController.getStockInById)
    .put(authenticateToken, authorizeRoles('admin', 'stock_manager'), stockInController.updateStockIn);


// --- 2. StockDetail (Line Items and Posting) Route ---

// POST /api/inventory/stock-in/:id/details
// This is the route that executes the complex logic:
// creates line items, creates StockTransactions, updates InventoryItem stock, and sets StockIn status to 'received'.
router.post(
    '/:id/details', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockDetailController.createStockDetails
);


module.exports = router;