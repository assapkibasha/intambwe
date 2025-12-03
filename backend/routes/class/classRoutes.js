const express = require('express');
const router = express.Router();
const classController = require('../../controllers/class/classController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE class
router.post('/', authenticateToken, authorizeRoles('admin'), classController.createClass);

// READ classes
router.get('/', authenticateToken, classController.getAllClasses);
router.get('/:id', authenticateToken, classController.getClassById);

// UPDATE class
router.put('/:id', authenticateToken, authorizeRoles('admin'), classController.updateClass);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), classController.updateClass);

// DELETE class
router.delete('/:id', authenticateToken, authorizeRoles('admin'), classController.deleteClass);

// Class relations
router.get('/:id/students', authenticateToken, classController.getClassStudents);
router.get('/:id/subjects', authenticateToken, classController.getClassSubjects);
router.get('/:id/overview', authenticateToken, classController.getClassOverview);

module.exports = router;
