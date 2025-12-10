// routes/inventoryLocation/inventoryLocationRoutes.js
const express = require('express');
const router = express.Router();
const inventoryLocationController = require('../../controllers/inventoryLocationController');
const { authenticateToken, authorizeRoles } = require('../../middleware/employeeAuth');

// List locations
router.get('/', authenticateToken, inventoryLocationController.listLocations);

// Get location
router.get('/:id', authenticateToken, inventoryLocationController.getLocation);

// Get items in location
router.get('/:location_id/items', authenticateToken, (req, res) => {
  const inventoryController = require('../../controllers/inventoryController');
  inventoryController.getItemsByLocation(req, res);
});

// Create location (admin/stock manager)
router.post('/', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryLocationController.createLocation);

// Update location (admin/stock manager)
router.put('/:id', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryLocationController.updateLocation);

// Delete location (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), inventoryLocationController.deleteLocation);

// Add item to location
router.post('/item-mapping/add', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryLocationController.addItemToLocation);

// Remove item from location
router.delete('/item-mapping/:item_location_id', authenticateToken, authorizeRoles('admin','stock_manager'), inventoryLocationController.removeItemFromLocation);

module.exports = router;
