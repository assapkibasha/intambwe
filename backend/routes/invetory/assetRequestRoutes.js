const express = require('express');
const router = express.Router();
const assetRequestController = require('../../controllers/invetory/AssetRequestController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth'); 

// =========================================================
// A. Requester Endpoints (Accessed by any authenticated Employee)
// =========================================================

// POST: Create a new Asset Request (e.g., /api/inventory/requests)
router.post(
    '/', 
    authenticateToken, 
    authorizeRoles('employee', 'admin', 'stock_manager'), // All employees can request
    assetRequestController.createRequest
);

// GET: View requests made by the current user (e.g., /api/inventory/requests/my)
router.get(
    '/my', 
    authenticateToken, 
    authorizeRoles('employee', 'admin', 'stock_manager'),
    assetRequestController.listMyRequests
);

// =========================================================
// B. Inventory Manager Endpoints (Review/Approval)
// =========================================================

// GET: List ALL requests (filtered by status=pending by default)
router.get(
    '/', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    assetRequestController.listAllRequests
);

// PUT: Review, Approve, or Reject a specific request (e.g., /api/inventory/requests/12/review)
router.put(
    '/:id/review', 
    authenticateToken, 
    authorizeRoles('admin', 'stock_manager'), 
    assetRequestController.reviewAndIssueRequest
);

module.exports = router;