const express = require('express');
const router = express.Router();
const specialEventController = require('../../controllers/specialEvent/specialEventController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE event
router.post('/', authenticateToken, authorizeRoles('admin'), specialEventController.createEvent);

// READ events
router.get('/', authenticateToken, specialEventController.getEvents);
router.get('/:id', authenticateToken, specialEventController.getEventById);

// UPDATE event
router.put('/:id', authenticateToken, authorizeRoles('admin'), specialEventController.updateEvent);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), specialEventController.updateEvent);

// DELETE event
router.delete('/:id', authenticateToken, authorizeRoles('admin'), specialEventController.deleteEvent);

module.exports = router;
