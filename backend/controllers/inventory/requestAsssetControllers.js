const { Op } = require("sequelize");
const {
  RequestAsset,
  Inventory,
  TransactionReport,
  Employee,
} = require("../../model");

const requestAssetController = {
  // CREATE REQUEST
  async createRequest(req, res) {
    try {
      const data = req.body;
      const requesterId = req.user.emp_id;

      const inventory = await Inventory.findByPk(data.inventory_id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      let status = "PENDING";

      if (inventory.quantity <= 0) {
        status = "UNAVAILABLE";
      }

      const request = await RequestAsset.create({
        inventory_id: data.inventory_id,
        requested_quantity: data.requested_quantity,
        requested_by: requesterId,
        remarks: data.remarks,
        request_status: status,
      });

      await TransactionReport.create({
        inventory_id: inventory.inventory_id,
        request_id: request.request_id,
        performed_by: requesterId,
      });

      return res.status(201).json({
        success: true,
        message: "Request created successfully",
        data: request,
      });
    } catch (error) {
      console.error("Error creating request:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // APPROVE REQUEST
  async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const approverId = req.user.emp_id;

      const request = await RequestAsset.findByPk(id, {
        include: ["inventory"],
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      const inventory = request.inventory;

      if (inventory.quantity < request.requested_quantity) {
        await request.update({ request_status: "UNAVAILABLE" });

        return res.status(200).json({
          success: true,
          message: "Inventory unavailable for requested quantity",
        });
      }

      await inventory.update({
        quantity: inventory.quantity - request.requested_quantity,
      });

      await request.update({
        request_status: "APPROVED",
        approved_by: approverId,
      });

      await TransactionReport.create({
        inventory_id: inventory.inventory_id,
        request_id: request.request_id,
        performed_by: approverId,
      });

      return res.status(200).json({
        success: true,
        message: "Request approved successfully",
        data: request,
      });
    } catch (error) {
      console.error("Error approving request:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // RETURN ITEM
  async returnAsset(req, res) {
    try {
      const { id } = req.params;
      const performerId = req.user.emp_id;

      const request = await RequestAsset.findByPk(id, {
        include: ["inventory"],
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      await request.inventory.increment("quantity", {
        by: request.requested_quantity,
      });

      await request.update({ request_status: "RETURNED" });

      await TransactionReport.create({
        inventory_id: request.inventory.inventory_id,
        request_id: request.request_id,
        performed_by: performerId,
      });

      return res.status(200).json({
        success: true,
        message: "Asset returned successfully",
      });
    } catch (error) {
      console.error("Error returning asset:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = requestAssetController;
