const { Supplier } = require("../../model");

const supplierController = {
  async createSupplier(req, res) {
    try {
      const supplier = await Supplier.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Supplier created successfully",
        data: supplier,
      });
    } catch (error) {
      console.error("Error creating supplier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getAllSuppliers(req, res) {
    try {
      const suppliers = await Supplier.findAll({
        order: [["supplier_name", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getSupplierById(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      console.error("Error fetching supplier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async updateSupplier(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      await supplier.update(req.body);

      return res.status(200).json({
        success: true,
        message: "Supplier updated successfully",
        data: supplier,
      });
    } catch (error) {
      console.error("Error updating supplier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async deleteSupplier(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      await supplier.destroy();

      return res.status(200).json({
        success: true,
        message: "Supplier deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = supplierController;
