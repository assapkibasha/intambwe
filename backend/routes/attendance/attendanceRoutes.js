const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/attendance/attendanceController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// CREATE or update attendance (upsert behavior in controller)
router.post('/', authenticateToken, authorizeRoles('admin'), attendanceController.recordAttendance);

// READ attendance list with filters/pagination
router.get('/', authenticateToken, attendanceController.getAttendance);

// READ single attendance record by ID
router.get('/:id', authenticateToken, attendanceController.getAttendanceById);

// UPDATE attendance record
router.put('/:id', authenticateToken, authorizeRoles('admin'), attendanceController.updateAttendance);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), attendanceController.updateAttendance);

// DELETE attendance record
router.delete('/:id', authenticateToken, authorizeRoles('admin'), attendanceController.deleteAttendance);

// STUDENT attendance summary
router.get('/student/:student_id/summary', authenticateToken, attendanceController.getStudentAttendanceSummary);

module.exports = router;
