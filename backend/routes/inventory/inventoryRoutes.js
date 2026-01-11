const express = require("express");
const router = express.Router();

const inventoryController = require("../../controllers/inventory/inventoryController");
const { authenticateToken, authorizeRoles } = require("../../middleware/employeeAuth");

router.get(
  "/summary",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  inventoryController.getInventorySummary
);

module.exports = router;
