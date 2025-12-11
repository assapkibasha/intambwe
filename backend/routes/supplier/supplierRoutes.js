// routes/supplier/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../../controllers/supplier/supplierController'); 
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// POST: Create a new Supplier
router.post(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    supplierController.createSupplier
);

// GET: List all Suppliers
router.get(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager', 'employee'), 
    supplierController.listSuppliers
);

// GET, PUT, DELETE operations on a specific Supplier ID
router.route('/:id')
    .get(authenticateToken, authorizeRoles('admin', 'stock_manager', 'employee'), supplierController.getSupplierById)
    .put(authenticateToken, authorizeRoles('admin', 'stock_manager'), supplierController.updateSupplier)
    .delete(authenticateToken, authorizeRoles('admin', 'stock_manager'), supplierController.deleteSupplier);


module.exports = router;