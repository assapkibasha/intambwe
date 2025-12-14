const { Op } = require("sequelize");
const { Inventory, Category, Supplier, Warehouse } = require("../../model");
const inventoryValidator = require("../../validators/inventoryValidator");

const inventoryController = {
  // CREATE
  async createInventory(req, res) {
    try {
      const data = req.body;

      const validation = inventoryValidator.validateInventoryData(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      const category = await Category.findByPk(data.category_id);
      if (!category)
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });

      const supplier = await Supplier.findByPk(data.supplier_id);
      if (!supplier)
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });

      const warehouse = await Warehouse.findByPk(data.warehouse_id);
      if (!warehouse)
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });

      const codeExists = await Inventory.findOne({
        where: { item_code: data.item_code },
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: "Item code already exists",
        });
      }

      const skuExists = await Inventory.findOne({
        where: { item_sku: data.item_sku },
      });

      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "Item SKU already exists",
        });
      }

      const inventory = await Inventory.create(data);

      return res.status(201).json({
        success: true,
        message: "Inventory item created successfully",
        data: inventory,
      });
    } catch (error) {
      console.error("Error creating inventory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // READ ALL
  async getAllInventory(req, res) {
    try {
      const { category_id, warehouse_id, status } = req.query;

      const whereClause = {};
      if (category_id) whereClause.category_id = category_id;
      if (warehouse_id) whereClause.warehouse_id = warehouse_id;
      if (status) whereClause.status = status;

      const inventory = await Inventory.findAll({
        where: whereClause,
        include: ["category", "supplier", "warehouse"],
        order: [["item_name", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // READ BY ID
  async getInventoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid inventory ID",
        });
      }

      const inventory = await Inventory.findByPk(id, {
        include: ["category", "supplier", "warehouse"],
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // UPDATE
  async updateInventory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid inventory ID",
        });
      }

      const inventory = await Inventory.findByPk(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      const validation = inventoryValidator.validateInventoryData(
        updateData,
        true
      );
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      await inventory.update(updateData);

      // 🔴 Auto unavailable if below minimum stock
      if (inventory.quantity <= inventory.min_stock_level) {
        await inventory.update({ status: "LOST" });
      }

      const updated = await Inventory.findByPk(id, {
        include: ["category", "supplier", "warehouse"],
      });

      return res.status(200).json({
        success: true,
        message: "Inventory updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // DELETE
  async deleteInventory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid inventory ID",
        });
      }

      const inventory = await Inventory.findByPk(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      await inventory.destroy();

      return res.status(200).json({
        success: true,
        message: "Inventory deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting inventory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = inventoryController;
