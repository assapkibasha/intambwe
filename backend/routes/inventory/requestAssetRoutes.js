const router = require("express").Router();
const controller = require("../../controllers/inventory/requestAsssetControllers");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middleware/employeeAuth");

// CREATE request (any authenticated user)
router.post("/", authenticateToken, controller.createRequest);

// APPROVE / RETURN (admin + stock manager)
router.post(
  "/:id/approve",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  controller.approveRequest
);

router.post(
  "/:id/return",
  authenticateToken,
  authorizeRoles("admin", "stock_manager"),
  controller.returnAsset
);

module.exports = router;
