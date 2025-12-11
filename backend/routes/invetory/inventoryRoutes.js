// routes/invetory/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/invetory/inventoryController'); 
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// POST: Create a new Inventory Item
router.post(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    inventoryController.createInventoryItem
);

// GET: List all Inventory Items
router.get(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager', 'employee'), 
    inventoryController.listInventoryItems
);

// GET, PUT, DELETE operations on a specific Item ID
router.route('/:id')
    .get(authenticateToken, authorizeRoles('admin', 'stock_manager', 'employee'), inventoryController.getInventoryItemById)
    .put(authenticateToken, authorizeRoles('admin', 'stock_manager'), inventoryController.updateInventoryItem)
    .delete(authenticateToken, authorizeRoles('admin', 'stock_manager'), inventoryController.deleteInventoryItem);


module.exports = router;