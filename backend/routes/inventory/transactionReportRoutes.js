const router = require("express").Router();
const controller = require("../../controllers/inventory/transactionReportControllers");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middleware/employeeAuth");

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  controller.getAllTransactions
);

module.exports = router;
