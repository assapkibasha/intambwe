// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/employeeAuth');

router.get('/', authenticateToken, categoryController.listCategories);
router.get('/:id', authenticateToken, categoryController.getCategory);
router.post('/', authenticateToken, authorizeRoles('admin','stock_manager'), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin','stock_manager'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin','stock_manager'), categoryController.deleteCategory);

module.exports = router;
