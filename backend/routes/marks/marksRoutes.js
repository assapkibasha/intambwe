const express = require('express');
const router = express.Router();
const marksController = require('../../controllers/marks/marksController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// ==================== CREATE / UPDATE (Upsert) ====================
// Create or update marks (teacher or admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  marksController.createMarks
);

// ==================== READ ====================
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  marksController.getMarks
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  marksController.getMarksById
);

// ==================== UPDATE ====================
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  marksController.updateMarks
);

router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  marksController.updateMarks
);

// ==================== DELETE ====================
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  marksController.deleteMarks
);

// ==================== STUDENT TRANSCRIPT ====================
router.get(
  '/student/:std_id/transcript',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  marksController.getStudentTranscript
);

module.exports = router;
