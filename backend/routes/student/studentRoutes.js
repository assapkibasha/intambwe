// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/student/studentController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// -----------------------
// CREATE STUDENT
// -----------------------
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin'),
   
  studentController.createStudent
);

// -----------------------
// READ STUDENTS
// -----------------------
router.get('/', 
  authenticateToken, 
  
  studentController.getAllStudents
);

// Search
router.get('/search', 
  authenticateToken, 
 
  studentController.searchStudents
);

// Statistics
router.get('/stats',
  authenticateToken,
  authorizeRoles('admin'),
  studentController.getStudentStats
);

// Get students by class
router.get('/class/:class_id',
  authenticateToken,

  studentController.getStudentsByClass
);

// Get student by ID
router.get('/:id', 
  authenticateToken, 

  studentController.getStudentById
);

// -----------------------
// UPDATE STUDENT
// -----------------------
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin'), 
  studentController.updateStudent
);

router.patch('/:id', 
  authenticateToken, 
  authorizeRoles('admin'), 
  studentController.updateStudent
);

// -----------------------
// DELETE STUDENT
// -----------------------
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'), 
  studentController.deleteStudent
);

module.exports = router;
