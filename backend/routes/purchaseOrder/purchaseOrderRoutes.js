// routes/purchaseOrder/purchaseOrderRoutes.js
const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../../controllers/purchaseOrderController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// List purchase orders
router.get('/', authenticateToken, purchaseOrderController.listPurchaseOrders);

// Get purchase order
router.get('/:id', authenticateToken, purchaseOrderController.getPurchaseOrder);

// Create purchase order (admin/stock manager)
router.post('/', authenticateToken, authorizeRoles('admin','stock_manager'), purchaseOrderController.createPurchaseOrder);

// Update PO status (admin/stock manager)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin','stock_manager'), purchaseOrderController.updatePurchaseOrderStatus);

// Receive PO items (admin/stock manager)
router.post('/:po_id/receive', authenticateToken, authorizeRoles('admin','stock_manager'), purchaseOrderController.receivePurchaseOrderItems);

// Cancel PO (admin/stock manager)
router.patch('/:id/cancel', authenticateToken, authorizeRoles('admin','stock_manager'), purchaseOrderController.cancelPurchaseOrder);

module.exports = router;
