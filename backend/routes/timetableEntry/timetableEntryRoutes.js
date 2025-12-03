const express = require('express');
const router = express.Router();
const timetableEntryController = require('../../controllers/timetableEntry/timetableEntryController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE timetable entry
router.post('/', authenticateToken, authorizeRoles('admin'), timetableEntryController.createEntry);

// READ entries
router.get('/', authenticateToken, timetableEntryController.getEntries);
router.get('/:id', authenticateToken, timetableEntryController.getEntryById);

// UPDATE entry
router.put('/:id', authenticateToken, authorizeRoles('admin'), timetableEntryController.updateEntry);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), timetableEntryController.updateEntry);

// DELETE entry
router.delete('/:id', authenticateToken, authorizeRoles('admin'), timetableEntryController.deleteEntry);

module.exports = router;
