const express = require("express");
const router = express.Router();

const categoryController = require("../../controllers/inventory/categoryController");
const { authenticateToken, authorizeRoles } = require("../../middleware/employeeAuth");

router.post("/", authenticateToken, authorizeRoles("admin", "stock_manager"), categoryController.createCategory);
router.get("/", authenticateToken, authorizeRoles("admin", "stock_manager"), categoryController.getAllCategories);
router.get("/:id", authenticateToken, authorizeRoles("admin", "stock_manager"), categoryController.getCategoryById);
router.put("/:id", authenticateToken, authorizeRoles("admin", "stock_manager"), categoryController.updateCategory);
router.patch("/:id", authenticateToken, authorizeRoles("admin", "stock_manager"), categoryController.updateCategory);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), categoryController.deleteCategory);

module.exports = router;
