// routes/assetCategory/assetCategoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/assetCategory/categoryController'); 
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// POST: Create a new Category
router.post(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    categoryController.createCategory
);

// GET: List all Categories
router.get(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager', 'employee'), 
    categoryController.listCategories
);

// GET, PUT, DELETE operations on a specific Category ID
router.route('/:id')
    .get(authenticateToken, authorizeRoles('admin', 'stock_manager', 'employee'), categoryController.getCategoryById)
    .put(authenticateToken, authorizeRoles('admin', 'stock_manager'), categoryController.updateCategory)
    .delete(authenticateToken, authorizeRoles('admin', 'stock_manager'), categoryController.deleteCategory);


module.exports = router;