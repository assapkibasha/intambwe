const express = require("express");
const router = express.Router();

const productController = require("../../controllers/inventory/productController");
const { authenticateToken, authorizeRoles } = require("../../middleware/employeeAuth");

router.post("/", authenticateToken, authorizeRoles("admin", "stock_manager"), productController.createProduct);
router.get("/", authenticateToken, authorizeRoles("admin", "stock_manager"), productController.getAllProducts);
router.get("/:id", authenticateToken, authorizeRoles("admin", "stock_manager"), productController.getProductById);
router.put("/:id", authenticateToken, authorizeRoles("admin", "stock_manager"), productController.updateProduct);
router.patch("/:id", authenticateToken, authorizeRoles("admin", "stock_manager"), productController.updateProduct);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), productController.deleteProduct);

module.exports = router;
