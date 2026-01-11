const express = require("express");
const router = express.Router();

const stockOutController = require("../../controllers/inventory/stockOutController");
const { authenticateToken, authorizeRoles } = require("../../middleware/employeeAuth");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  stockOutController.createStockOut
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  stockOutController.getAllStockOut
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  stockOutController.getStockOutById
);

module.exports = router;
