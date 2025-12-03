const express = require('express');
const router = express.Router();
const timetableController = require('../../controllers/timetable/timetableController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE timetable
router.post('/', authenticateToken, authorizeRoles('admin'), timetableController.createTimetable);

// READ timetables
router.get('/', authenticateToken, timetableController.getAllTimetables);
router.get('/:id', authenticateToken, timetableController.getTimetableById);

// UPDATE timetable
router.put('/:id', authenticateToken, authorizeRoles('admin'), timetableController.updateTimetable);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), timetableController.updateTimetable);

// DELETE timetable
router.delete('/:id', authenticateToken, authorizeRoles('admin'), timetableController.deleteTimetable);

// Set active timetable
router.post('/:id/activate', authenticateToken, authorizeRoles('admin'), timetableController.setActiveTimetable);

// Get active timetable
router.get('/active/current', authenticateToken, timetableController.getActiveTimetable);

module.exports = router;
