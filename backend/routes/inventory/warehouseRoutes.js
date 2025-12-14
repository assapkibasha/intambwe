const router = require("express").Router();
const controller = require("../../controllers/inventory/warehouseControllers");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middleware/employeeAuth");

router.use(authenticateToken, authorizeRoles("admin", "stock_manager"));

router.post("/", controller.createWarehouse);
router.get("/", controller.getAllWarehouses);
router.get("/:id", controller.getWarehouseById);
router.put("/:id", controller.updateWarehouse);
router.delete("/:id", controller.deleteWarehouse);

module.exports = router;
