const { StockIn, Stock, Product } = require("../../model");

const stockItemController = {
  async listStockItems(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid stock in id" });
      }

      const stockIn = await StockIn.findByPk(id);
      if (!stockIn) {
        return res.status(404).json({ success: false, message: "Stock In record not found" });
      }

      const items = await Stock.findAll({
        where: { stock_inId: Number(id) },
        include: [{ model: Product, as: "product" }],
        order: [["stock_id", "DESC"]],
      });

      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      console.error("Error listing stock items:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async addStockItems(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid stock in id" });
      }

      const stockIn = await StockIn.findByPk(id);
      if (!stockIn) {
        return res.status(404).json({ success: false, message: "Stock In record not found" });
      }

      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "items are required" });
      }

      const created = [];
      for (const it of items) {
        if (!it.item_id) {
          return res.status(400).json({ success: false, message: "Each item must include item_id" });
        }

        const product = await Product.findByPk(it.item_id);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found: ${it.item_id}` });
        }

        if (product.track_serial) {
          if (!it.sn_id) {
            return res.status(400).json({ success: false, message: `sn_id is required for serial-tracked product ${it.item_id}` });
          }
          if (Number(it.quantity) !== 1) {
            return res.status(400).json({ success: false, message: `quantity must be 1 for serial-tracked product ${it.item_id}` });
          }
        }

        const row = await Stock.create({
          stock_inId: Number(id),
          item_id: it.item_id,
          number: it.number ?? "",
          sn_id: it.sn_id ?? null,
          quantity: Number(it.quantity ?? 0),
          gr_id: it.gr_id ?? "",
          received_date: it.received_date ? new Date(it.received_date) : stockIn.received_date,
          issued_nonprofit: Boolean(it.issued_nonprofit ?? false),
          issued_date: it.issued_date ? new Date(it.issued_date) : null,
          euro_id: it.euro_id ?? null,
          unit_price: it.unit_price ?? 0,
        });

        created.push(row);
      }

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error("Error adding stock items:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },
};

module.exports = stockItemController;
