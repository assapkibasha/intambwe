const { Warehouse } = require("../../model");

const warehouseController = {
  async createWarehouse(req, res) {
    try {
      const warehouse = await Warehouse.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Warehouse created successfully",
        data: warehouse,
      });
    } catch (error) {
      console.error("Error creating warehouse:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getAllWarehouses(req, res) {
    try {
      const warehouses = await Warehouse.findAll({
        order: [["warehouse_name", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: warehouses,
      });
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getWarehouseById(req, res) {
    try {
      const warehouse = await Warehouse.findByPk(req.params.id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      console.error("Error fetching warehouse:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async updateWarehouse(req, res) {
    try {
      const warehouse = await Warehouse.findByPk(req.params.id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }

      await warehouse.update(req.body);

      return res.status(200).json({
        success: true,
        message: "Warehouse updated successfully",
        data: warehouse,
      });
    } catch (error) {
      console.error("Error updating warehouse:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async deleteWarehouse(req, res) {
    try {
      const warehouse = await Warehouse.findByPk(req.params.id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Warehouse not found",
        });
      }

      await warehouse.destroy();

      return res.status(200).json({
        success: true,
        message: "Warehouse deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = warehouseController;
