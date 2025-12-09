// routes/inventoryRequestRoutes.js
const express = require('express');
const router = express.Router();
const inventoryRequestController = require('../controllers/inventoryRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/employeeAuth');

// Employees can create requests and view their requests
router.post('/', authenticateToken, inventoryRequestController.createRequest);
router.get('/', authenticateToken, inventoryRequestController.listRequests);
router.get('/:id', authenticateToken, inventoryRequestController.getRequest);

// Admins / stock managers approve or reject
router.post('/:id/approve', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryRequestController.approveRequest);
router.post('/:id/reject', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryRequestController.rejectRequest);

module.exports = router;
