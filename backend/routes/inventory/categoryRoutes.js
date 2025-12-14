const router = require("express").Router();
const controller = require("../../controllers/inventory/categoryControllers");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middleware/employeeAuth");

router.use(authenticateToken, authorizeRoles("admin", "stock_manager"));

router.post("/", controller.createCategory);
router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);
router.put("/:id", controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

module.exports = router;
