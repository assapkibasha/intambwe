// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/employeeAuth');

// Public listing
router.get('/', authenticateToken, inventoryController.listItems);
router.get('/:id', authenticateToken, inventoryController.getItem);

// Admin or stock_manager can create/update/delete
router.post('/', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryController.createItem);
router.put('/:id', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryController.updateItem);
router.delete('/:id', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryController.deleteItem);

module.exports = router;
