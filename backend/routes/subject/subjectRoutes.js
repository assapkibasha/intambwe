const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/subject/subjectController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE subject
router.post('/', authenticateToken, authorizeRoles('admin'), subjectController.createSubject);

// READ subjects
router.get('/', authenticateToken, subjectController.getAllSubjects);
router.get('/:id', authenticateToken, subjectController.getSubjectById);

// UPDATE subject
router.put('/:id', authenticateToken, authorizeRoles('admin'), subjectController.updateSubject);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), subjectController.updateSubject);

// DELETE subject
router.delete('/:id', authenticateToken, authorizeRoles('admin'), subjectController.deleteSubject);

module.exports = router;
