// middleware/studentAuth.js
const jwt = require('jsonwebtoken');
const { Student } = require('../model');

// Verify JWT token and attach student to request
const authenticateStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Fetch student details
    const student = await Student.findByPk(decoded.std_id);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Attach student to request
    req.student = {
      std_id: student.std_id,
      std_fname: student.std_fname,
      std_lname: student.std_lname,
      std_email: student.std_email,
      std_grade: student.std_grade,
      class_id: student.class_id,
      parent_id: student.parent_id,
      dpt_id: student.dpt_id
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Check if student is accessing their own resource
const authorizeOwner = (req, res, next) => {
  if (!req.student) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const resourceId = parseInt(req.params.id || req.params.std_id);
  const isOwner = req.student.std_id === resourceId;

  if (!isOwner) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own resources.' 
    });
  }

  next();
};

// Check if student belongs to specific class
const authorizeClass = (req, res, next) => {
  if (!req.student) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const classId = parseInt(req.params.class_id || req.body.class_id);
  const sameClass = req.student.class_id === classId;

  if (!sameClass) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access resources in your class.' 
    });
  }

  next();
};

// Check if student belongs to specific department
const authorizeDepartment = (req, res, next) => {
  if (!req.student) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const deptId = parseInt(req.params.dpt_id || req.body.dpt_id);
  const sameDepartment = req.student.dpt_id === deptId;

  if (!sameDepartment) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access resources in your department.' 
    });
  }

  next();
};

// Check if student belongs to specific grade
const authorizeGrade = (req, res, next) => {
  if (!req.student) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const grade = req.params.grade || req.body.grade;
  const sameGrade = req.student.std_grade === grade;

  if (!sameGrade) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access resources for your grade level.' 
    });
  }

  next();
};

module.exports = {
  authenticateStudent,
  authorizeOwner,
  authorizeClass,
  authorizeDepartment,
  authorizeGrade
};