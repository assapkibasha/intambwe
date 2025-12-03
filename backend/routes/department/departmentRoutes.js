// routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/department/departmentController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE
router.post('/', authenticateToken, authorizeRoles('admin'), departmentController.createDepartment);

// READ
router.get('/', authenticateToken, authorizeRoles('admin'), departmentController.getAllDepartments);
router.get('/:id', authenticateToken, authorizeRoles('admin'), departmentController.getDepartmentById);

// OVERVIEW
router.get('/:id/overview', authenticateToken, authorizeRoles('admin'), departmentController.getDepartmentOverview);

// UPDATE
router.put('/:id', authenticateToken, authorizeRoles('admin'), departmentController.updateDepartment);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), departmentController.updateDepartment);

// DELETE
router.delete('/:id', authenticateToken, authorizeRoles('admin'), departmentController.deleteDepartment);

module.exports = router;
