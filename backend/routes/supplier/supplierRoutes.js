// routes/supplier/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../../controllers/supplierController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// List suppliers
router.get('/', authenticateToken, supplierController.listSuppliers);

// Get supplier
router.get('/:id', authenticateToken, supplierController.getSupplier);

// Create supplier (admin/stock manager)
router.post('/', authenticateToken, authorizeRoles('admin','stock_manager'), supplierController.createSupplier);

// Update supplier (admin/stock manager)
router.put('/:id', authenticateToken, authorizeRoles('admin','stock_manager'), supplierController.updateSupplier);

// Delete supplier (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), supplierController.deleteSupplier);

module.exports = router;
