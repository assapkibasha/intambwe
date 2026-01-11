const { Op, fn, col, literal } = require("sequelize");
const { Product, Category, Stock } = require("../../model");

const inventoryController = {
  async getInventorySummary(req, res) {
    try {
      const { search = "", category_id } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { item_id: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } },
        ];
      }

      if (category_id) {
        where.category_id = category_id;
      }

      const rows = await Product.findAll({
        where,
        attributes: {
          include: [
            [
              fn("COALESCE", fn("SUM", col("stockBatches.quantity")), 0),
              "on_hand_quantity",
            ],
          ],
        },
        includeIgnoreAttributes: false,
        include: [
          { model: Category, as: "category" },
          { model: Stock, as: "stockBatches", attributes: [] },
        ],
        group: ["Product.item_id", "category.category_id"],
        order: [["name", "ASC"]],
      });

      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },
};

module.exports = inventoryController;
