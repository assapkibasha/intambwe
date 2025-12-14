const router = require("express").Router();
const controller = require("../../controllers/inventory/inventoryControllers");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middleware/employeeAuth");

router.use(authenticateToken, authorizeRoles("admin", "stock_manager"));

router.post("/", controller.createInventory);
router.get("/", controller.getAllInventory);
router.get("/:id", controller.getInventoryById);
router.put("/:id", controller.updateInventory);
router.delete("/:id", controller.deleteInventory);

module.exports = router;
