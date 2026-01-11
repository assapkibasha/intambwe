const express = require("express");
const router = express.Router();

const saleController = require("../../controllers/inventory/saleController");
const { authenticateToken, authorizeRoles } = require("../../middleware/employeeAuth");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  saleController.createSale
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  saleController.getAllSales
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  saleController.getSaleById
);

router.post(
  "/:sale_id/returns",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  saleController.createReturn
);

router.get(
  "/:sale_id/returns",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  saleController.listReturnsForSale
);

module.exports = router;
