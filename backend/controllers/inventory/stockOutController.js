const { Op } = require("sequelize");
const { sequelize, StockOut, StockOutItem, Stock, Product, Employee } = require("../../model");

function makeRef(prefix) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yyyy}${mm}${dd}-${rand}`;
}

async function ensureReference(desired) {
  if (desired) return desired;
  for (let i = 0; i < 5; i += 1) {
    const ref = makeRef("OUT");
    const exists = await StockOut.findOne({ where: { reference_number: ref } });
    if (!exists) return ref;
  }
  return makeRef("OUT");
}

async function deductStock(items, issuedDate, t) {
  for (const it of items) {
    const product = await Product.findByPk(it.item_id, { transaction: t });
    if (!product) throw new Error(`Product not found: ${it.item_id}`);

    const qty = Number(it.quantity);
    if (!Number.isFinite(qty) || qty <= 0) throw new Error(`Invalid quantity for ${it.item_id}`);

    if (product.track_serial) {
      if (!it.sn_id) throw new Error(`sn_id is required for serial-tracked product ${it.item_id}`);
      if (qty !== 1) throw new Error(`Quantity must be 1 for serial-tracked product ${it.item_id}`);

      const stockRow = await Stock.findOne({ where: { item_id: it.item_id, sn_id: it.sn_id }, transaction: t });
      if (!stockRow || Number(stockRow.quantity) <= 0) {
        throw new Error(`Insufficient stock for ${it.item_id} SN ${it.sn_id}`);
      }

      await stockRow.update({ quantity: 0, issued_nonprofit: true, issued_date: issuedDate }, { transaction: t });
    } else {
      const stockRows = await Stock.findAll({
        where: { item_id: it.item_id },
        order: [["received_date", "ASC"], ["stock_id", "ASC"]],
        transaction: t,
      });

      let remaining = qty;
      const totalAvailable = stockRows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
      if (totalAvailable < remaining) throw new Error(`Insufficient stock for ${it.item_id}`);

      for (const row of stockRows) {
        if (remaining <= 0) break;
        const available = Number(row.quantity || 0);
        if (available <= 0) continue;
        const take = Math.min(available, remaining);
        await row.update({ quantity: available - take }, { transaction: t });
        remaining -= take;
      }

      if (remaining > 0) throw new Error(`Insufficient stock for ${it.item_id}`);
    }
  }
}

const stockOutController = {
  async createStockOut(req, res) {
    const t = await sequelize.transaction();
    try {
      const { reference_number, issued_date, issued_to_type, issued_to, notes, status, items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "items are required" });
      }

      const issuedDate = issued_date ? new Date(issued_date) : new Date();
      if (!(issuedDate instanceof Date) || isNaN(issuedDate)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Invalid issued_date" });
      }

      const issuedBy = req.employee?.emp_id;
      if (!issuedBy) {
        await t.rollback();
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const ref = await ensureReference(reference_number);

      await deductStock(items, issuedDate, t);

      const header = await StockOut.create(
        {
          reference_number: ref,
          issued_by: issuedBy,
          issued_date: issuedDate,
          issued_to_type: issued_to_type ?? "other",
          issued_to: issued_to ?? null,
          notes: notes ?? null,
          status: status ?? "issued",
        },
        { transaction: t }
      );

      for (const it of items) {
        await StockOutItem.create(
          {
            stock_outId: header.stock_outId,
            item_id: it.item_id,
            sn_id: it.sn_id ?? null,
            quantity: Number(it.quantity),
          },
          { transaction: t }
        );
      }

      await t.commit();

      const created = await StockOut.findByPk(header.stock_outId, {
        include: [
          { model: Employee, as: "issuer", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
          { model: StockOutItem, as: "items", include: [{ model: Product, as: "product" }] },
        ],
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      await t.rollback();
      console.error("Error creating stock out:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getAllStockOut(req, res) {
    try {
      const { from, to, status, search = "" } = req.query;
      const where = {};

      if (status) where.status = status;

      if (from || to) {
        where.issued_date = {};
        if (from) where.issued_date[Op.gte] = new Date(from);
        if (to) where.issued_date[Op.lte] = new Date(to);
      }

      if (search) {
        where[Op.or] = [
          { reference_number: { [Op.like]: `%${search}%` } },
          { issued_to: { [Op.like]: `%${search}%` } },
        ];
      }

      const rows = await StockOut.findAll({
        where,
        order: [["issued_date", "DESC"], ["stock_outId", "DESC"]],
        include: [{ model: Employee, as: "issuer", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] }],
      });

      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching stock out:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getStockOutById(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid stock out id" });
      }

      const row = await StockOut.findByPk(id, {
        include: [
          { model: Employee, as: "issuer", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
          { model: StockOutItem, as: "items", include: [{ model: Product, as: "product" }] },
        ],
      });

      if (!row) {
        return res.status(404).json({ success: false, message: "Stock out not found" });
      }

      return res.status(200).json({ success: true, data: row });
    } catch (error) {
      console.error("Error fetching stock out:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },
};

module.exports = stockOutController;
