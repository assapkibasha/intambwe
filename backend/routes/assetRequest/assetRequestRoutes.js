const express = require('express');
const router = express.Router();
const assetRequestController = require('../controllers/assetRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/employeeAuth');

// 1. EMPLOYEE ENDPOINT: Submit a new request (Frontend "Request Asset" button)
router.post(
    '/',
    authenticateToken,
    assetRequestController.createRequest
);

// 2. EMPLOYEE ENDPOINT: Get my request history (Frontend "My Requests" tab)
router.get(
    '/me',
    authenticateToken,
    assetRequestController.getMyRequests
);

// 3. MANAGER ENDPOINT: Get all PENDING requests (Manager Dashboard View)
router.get(
    '/pending',
    authenticateToken,
    authorizeRoles('admin', 'stock_manager'), // Only managers/admins can see these
    assetRequestController.getAllPendingRequests
);

// 4. MANAGER ENDPOINT: Approve/Reject a request (The Action)
router.patch(
    '/:id/process',
    authenticateToken,
    authorizeRoles('admin', 'stock_manager'), // Only managers/admins can process
    assetRequestController.processRequest
);

module.exports = router;