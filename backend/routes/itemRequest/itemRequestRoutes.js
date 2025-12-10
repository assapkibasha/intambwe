const express = require('express');
const router = express.Router();
const itemRequestController = require('../../controllers/itemRequestController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// ==========================================
// EMPLOYEE ENDPOINTS
// ==========================================

// Create a new item request
router.post(
  '/',
  authenticateToken,
  itemRequestController.createRequest
);

// Get my own requests (history)
router.get(
  '/me',
  authenticateToken,
  itemRequestController.getMyRequests
);

// Get single request details
router.get(
  '/:id',
  authenticateToken,
  itemRequestController.getRequest
);

// Update my pending request
router.put(
  '/:id',
  authenticateToken,
  itemRequestController.updateRequest
);

// Delete my pending request
router.delete(
  '/:id',
  authenticateToken,
  itemRequestController.deleteRequest
);

// ==========================================
// ADMIN/STOCK MANAGER ENDPOINTS
// ==========================================

// List all requests (with filtering & pagination)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'stock_manager'),
  itemRequestController.listRequests
);

// Get pending requests for approval
router.get(
  '/pending/list',
  authenticateToken,
  authorizeRoles('admin', 'stock_manager'),
  itemRequestController.getPendingRequests
);

// Approve a request
router.post(
  '/:id/approve',
  authenticateToken,
  authorizeRoles('admin', 'stock_manager'),
  itemRequestController.approveRequest
);

// Reject a request
router.post(
  '/:id/reject',
  authenticateToken,
  authorizeRoles('admin', 'stock_manager'),
  itemRequestController.rejectRequest
);

// Confirm a request (mark as fulfilled)
router.post(
  '/:id/confirm',
  authenticateToken,
  authorizeRoles('admin', 'stock_manager'),
  itemRequestController.confirmRequest
);

// ==========================================
// STATISTICS & REPORTING
// ==========================================

// Get request statistics
router.get(
  '/stats/overview',
  authenticateToken,
  authorizeRoles('admin', 'stock_manager'),
  itemRequestController.getRequestStats
);

module.exports = router;
