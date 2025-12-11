// routes/stockIn/stockInRoutes.js
const express = require('express');
const router = express.Router();
const stockInController = require('../../controllers/stockIn/stockInController'); 
const stockDetailController = require('../../controllers/stockIn/stockDetailController'); 
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// Base route for Stock In documents: /api/inventory/stock-in

// POST: Create a new Stock In Document (Header)
router.post(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockInController.createStockIn
);

// Example: POST /api/inventory/stock-in/2/details
router.post(
    '/:id/details', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockDetailController.createStockDetails // <--- ADD THIS LINE
);

// GET: List all Stock In Documents with filtering and pagination
router.get(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager', 'employee'), 
    stockInController.getAllStockIn
);

// GET: Stock In Summary/Statistics
router.get(
    '/summary', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockInController.getStockInSummary
);

// GET: Search Stock In Records
router.get(
    '/search', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager', 'employee'), 
    stockInController.searchStockIn
);

// GET, PUT, DELETE operations on a specific Stock In ID
router.route('/:id')
    .get(authenticateToken, authorizeRoles('admin', 'stock_manager', 'employee'), stockInController.getStockInById)
    .put(authenticateToken, authorizeRoles('admin', 'stock_manager'), stockInController.updateStockIn)
    .delete(authenticateToken, authorizeRoles('admin', 'stock_manager'), stockInController.deleteStockIn);

// PATCH: Update only the status of a Stock In document
router.patch(
    '/:id/status', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    stockInController.updateStockInStatus
);


module.exports = router;