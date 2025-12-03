const express = require('express');
const router = express.Router();
const marksController = require('../../controllers/marks/marksController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE or update marks (upsert behavior)
router.post('/', authenticateToken, authorizeRoles('admin'), marksController.createMarks);

// READ marks
router.get('/', authenticateToken, marksController.getMarks);
router.get('/:id', authenticateToken, marksController.getMarksById);

// UPDATE marks
router.put('/:id', authenticateToken, authorizeRoles('admin'), marksController.updateMarks);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), marksController.updateMarks);

// DELETE marks
router.delete('/:id', authenticateToken, authorizeRoles('admin'), marksController.deleteMarks);

// Student transcript
router.get('/student/:std_id/transcript', authenticateToken, marksController.getStudentTranscript);

module.exports = router;
