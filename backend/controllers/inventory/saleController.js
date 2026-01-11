const { Op } = require("sequelize");
const {
  sequelize,
  Sale,
  SaleItem,
  Product,
  Employee,
  Stock,
  SaleReturn,
  ReturnItem,
} = require("../../model");

function makeRef(prefix) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yyyy}${mm}${dd}-${rand}`;
}

async function ensureSaleNumber(desired) {
  if (desired) return desired;

  for (let i = 0; i < 5; i += 1) {
    const ref = makeRef("SAL");
    const exists = await Sale.findOne({ where: { sale_number: ref } });
    if (!exists) return ref;
  }

  return makeRef("SAL");
}

async function ensureReturnNumber(desired) {
  if (desired) return desired;

  for (let i = 0; i < 5; i += 1) {
    const ref = makeRef("RET");
    const exists = await SaleReturn.findOne({ where: { return_number: ref } });
    if (!exists) return ref;
  }

  return makeRef("RET");
}

async function deductStockForSaleItems(items, saleDate, t) {
  for (const item of items) {
    const product = await Product.findByPk(item.item_id, { transaction: t });
    if (!product) {
      throw new Error(`Product not found: ${item.item_id}`);
    }

    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for ${item.item_id}`);
    }

    if (product.track_serial) {
      if (!item.sn_id || String(item.sn_id).trim().length === 0) {
        throw new Error(`sn_id is required for serial-tracked product ${item.item_id}`);
      }
      if (qty !== 1) {
        throw new Error(`Quantity must be 1 for serial-tracked product ${item.item_id}`);
      }

      const stockRow = await Stock.findOne({
        where: { item_id: item.item_id, sn_id: item.sn_id },
        transaction: t,
      });

      if (!stockRow || Number(stockRow.quantity) <= 0) {
        throw new Error(`Insufficient stock for ${item.item_id} SN ${item.sn_id}`);
      }

      await stockRow.update(
        {
          quantity: 0,
          issued_nonprofit: true,
          issued_date: saleDate,
        },
        { transaction: t }
      );
    } else {
      const stockRows = await Stock.findAll({
        where: { item_id: item.item_id },
        order: [["received_date", "ASC"], ["stock_id", "ASC"]],
        transaction: t,
      });

      let remaining = qty;
      const totalAvailable = stockRows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
      if (totalAvailable < remaining) {
        throw new Error(`Insufficient stock for ${item.item_id}`);
      }

      for (const row of stockRows) {
        if (remaining <= 0) break;
        const available = Number(row.quantity || 0);
        if (available <= 0) continue;

        const take = Math.min(available, remaining);
        await row.update({ quantity: available - take }, { transaction: t });
        remaining -= take;
      }

      if (remaining > 0) {
        throw new Error(`Insufficient stock for ${item.item_id}`);
      }
    }
  }
}

async function restoreStockForReturnItems(items, returnDate, t) {
  for (const item of items) {
    const product = await Product.findByPk(item.item_id, { transaction: t });
    if (!product) {
      throw new Error(`Product not found: ${item.item_id}`);
    }

    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for ${item.item_id}`);
    }

    if (product.track_serial) {
      if (!item.sn_id || String(item.sn_id).trim().length === 0) {
        throw new Error(`sn_id is required for serial-tracked product ${item.item_id}`);
      }
      if (qty !== 1) {
        throw new Error(`Quantity must be 1 for serial-tracked product ${item.item_id}`);
      }

      const stockRow = await Stock.findOne({
        where: { item_id: item.item_id, sn_id: item.sn_id },
        transaction: t,
      });

      if (!stockRow) {
        throw new Error(`Stock row not found for ${item.item_id} SN ${item.sn_id}`);
      }

      await stockRow.update(
        {
          quantity: 1,
          issued_nonprofit: false,
          issued_date: null,
          received_date: stockRow.received_date || returnDate,
        },
        { transaction: t }
      );
    } else {
      const stockRow = await Stock.findOne({
        where: { item_id: item.item_id },
        order: [["received_date", "ASC"], ["stock_id", "ASC"]],
        transaction: t,
      });

      if (!stockRow) {
        throw new Error(`No stock record exists for product ${item.item_id} to restore into`);
      }

      const currentQty = Number(stockRow.quantity || 0);
      await stockRow.update({ quantity: currentQty + qty }, { transaction: t });
    }
  }
}

const saleController = {
  async createSale(req, res) {
    const t = await sequelize.transaction();
    try {
      const { customer_name, sale_date, status, notes, sale_number, items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "items are required" });
      }

      const saleDate = sale_date ? new Date(sale_date) : new Date();
      if (!(saleDate instanceof Date) || isNaN(saleDate)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Invalid sale_date" });
      }

      const createdBy = req.employee?.emp_id;
      if (!createdBy) {
        await t.rollback();
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const safeSaleNumber = await ensureSaleNumber(sale_number);

      const normalizedItems = [];
      for (const it of items) {
        const item_id = it.item_id;
        if (!item_id) {
          await t.rollback();
          return res.status(400).json({ success: false, message: "Each item must include item_id" });
        }

        const product = await Product.findByPk(item_id, { transaction: t });
        if (!product) {
          await t.rollback();
          return res.status(404).json({ success: false, message: `Product not found: ${item_id}` });
        }

        const qty = Number(it.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Invalid quantity for ${item_id}` });
        }

        const unit_price = it.unit_price !== undefined ? Number(it.unit_price) : Number(product.default_unit_price || 0);
        const discount = it.discount !== undefined ? Number(it.discount) : 0;
        const tax = it.tax !== undefined ? Number(it.tax) : 0;

        normalizedItems.push({
          item_id,
          sn_id: it.sn_id ?? null,
          quantity: qty,
          unit_price,
          discount,
          tax,
        });
      }

      await deductStockForSaleItems(normalizedItems, saleDate, t);

      const subtotal = normalizedItems.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
      const discount_total = normalizedItems.reduce((sum, it) => sum + Number(it.discount || 0), 0);
      const tax_total = normalizedItems.reduce((sum, it) => sum + Number(it.tax || 0), 0);
      const grand_total = subtotal - discount_total + tax_total;

      const sale = await Sale.create(
        {
          sale_number: safeSaleNumber,
          customer_name: customer_name ?? null,
          sale_date: saleDate,
          status: status ?? "completed",
          created_by: createdBy,
          subtotal,
          discount_total,
          tax_total,
          grand_total,
          notes: notes ?? null,
        },
        { transaction: t }
      );

      for (const it of normalizedItems) {
        await SaleItem.create(
          {
            sale_id: sale.sale_id,
            item_id: it.item_id,
            sn_id: it.sn_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount: it.discount,
            tax: it.tax,
          },
          { transaction: t }
        );
      }

      await t.commit();

      const created = await Sale.findByPk(sale.sale_id, {
        include: [
          { model: Employee, as: "creator", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
          { model: SaleItem, as: "items", include: [{ model: Product, as: "product" }] },
        ],
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      await t.rollback();
      console.error("Error creating sale:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getAllSales(req, res) {
    try {
      const { from, to, status, search = "" } = req.query;
      const where = {};

      if (status) where.status = status;

      if (from || to) {
        where.sale_date = {};
        if (from) where.sale_date[Op.gte] = new Date(from);
        if (to) where.sale_date[Op.lte] = new Date(to);
      }

      if (search) {
        where[Op.or] = [
          { sale_number: { [Op.like]: `%${search}%` } },
          { customer_name: { [Op.like]: `%${search}%` } },
        ];
      }

      const sales = await Sale.findAll({
        where,
        order: [["sale_date", "DESC"], ["sale_id", "DESC"]],
        include: [
          { model: Employee, as: "creator", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
        ],
      });

      return res.status(200).json({ success: true, data: sales });
    } catch (error) {
      console.error("Error fetching sales:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getSaleById(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid sale id" });
      }

      const sale = await Sale.findByPk(id, {
        include: [
          { model: Employee, as: "creator", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
          { model: SaleItem, as: "items", include: [{ model: Product, as: "product" }] },
          { model: SaleReturn, as: "returns", required: false },
        ],
      });

      if (!sale) {
        return res.status(404).json({ success: false, message: "Sale not found" });
      }

      return res.status(200).json({ success: true, data: sale });
    } catch (error) {
      console.error("Error fetching sale:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async createReturn(req, res) {
    const t = await sequelize.transaction();
    try {
      const { sale_id } = req.params;
      if (!sale_id || isNaN(sale_id)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Invalid sale id" });
      }

      const { return_date, reason, return_number, items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "items are required" });
      }

      const sale = await Sale.findByPk(sale_id, {
        include: [{ model: SaleItem, as: "items" }],
        transaction: t,
      });

      if (!sale) {
        await t.rollback();
        return res.status(404).json({ success: false, message: "Sale not found" });
      }

      const returnDate = return_date ? new Date(return_date) : new Date();
      if (!(returnDate instanceof Date) || isNaN(returnDate)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Invalid return_date" });
      }

      const returnedBy = req.employee?.emp_id;
      if (!returnedBy) {
        await t.rollback();
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const safeReturnNumber = await ensureReturnNumber(return_number);

      const normalizedItems = [];
      for (const it of items) {
        const item_id = it.item_id;
        if (!item_id) {
          await t.rollback();
          return res.status(400).json({ success: false, message: "Each return item must include item_id" });
        }

        const qty = Number(it.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Invalid quantity for ${item_id}` });
        }

        const matchingSaleItem = sale.items.find((si) => si.item_id === item_id && (it.sn_id ? si.sn_id === it.sn_id : true));
        if (!matchingSaleItem) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Item not found in sale: ${item_id}` });
        }

        const unit_price = it.unit_price !== undefined ? Number(it.unit_price) : Number(matchingSaleItem.unit_price || 0);

        normalizedItems.push({
          item_id,
          sn_id: it.sn_id ?? null,
          quantity: qty,
          unit_price,
        });
      }

      await restoreStockForReturnItems(normalizedItems, returnDate, t);

      const refund_total = normalizedItems.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);

      const saleReturn = await SaleReturn.create(
        {
          return_number: safeReturnNumber,
          sale_id: Number(sale_id),
          return_date: returnDate,
          status: "completed",
          returned_by: returnedBy,
          reason: reason ?? null,
          refund_total,
        },
        { transaction: t }
      );

      for (const it of normalizedItems) {
        await ReturnItem.create(
          {
            return_id: saleReturn.return_id,
            item_id: it.item_id,
            sn_id: it.sn_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
          },
          { transaction: t }
        );
      }

      await t.commit();

      const created = await SaleReturn.findByPk(saleReturn.return_id, {
        include: [
          { model: Sale, as: "sale" },
          { model: Employee, as: "returnedBy", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
          { model: ReturnItem, as: "items", include: [{ model: Product, as: "product" }] },
        ],
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      await t.rollback();
      console.error("Error creating return:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async listReturnsForSale(req, res) {
    try {
      const { sale_id } = req.params;
      if (!sale_id || isNaN(sale_id)) {
        return res.status(400).json({ success: false, message: "Invalid sale id" });
      }

      const returns = await SaleReturn.findAll({
        where: { sale_id: Number(sale_id) },
        order: [["return_date", "DESC"], ["return_id", "DESC"]],
        include: [
          { model: Employee, as: "returnedBy", attributes: ["emp_id", "emp_name", "emp_email", "emp_role"] },
          { model: ReturnItem, as: "items", include: [{ model: Product, as: "product" }] },
        ],
      });

      return res.status(200).json({ success: true, data: returns });
    } catch (error) {
      console.error("Error fetching returns:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },
};

module.exports = saleController;
