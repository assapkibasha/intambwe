const { Op } = require("sequelize");
const { Product, Category } = require("../../model");

const productController = {
  async createProduct(req, res) {
    try {
      const { item_id, name, sku, category_id, track_serial, default_unit_price, active } = req.body;

      if (!item_id || String(item_id).trim().length === 0) {
        return res.status(400).json({ success: false, message: "item_id is required" });
      }
      if (!name || String(name).trim().length === 0) {
        return res.status(400).json({ success: false, message: "name is required" });
      }

      const existing = await Product.findByPk(item_id);
      if (existing) {
        return res.status(409).json({ success: false, message: "Product already exists" });
      }

      if (category_id) {
        const cat = await Category.findByPk(category_id);
        if (!cat) {
          return res.status(404).json({ success: false, message: "Category not found" });
        }
      }

      const product = await Product.create({
        item_id,
        name,
        sku: sku ?? null,
        category_id: category_id ?? null,
        track_serial: Boolean(track_serial),
        default_unit_price: default_unit_price ?? 0,
        active: active === undefined ? true : Boolean(active),
      });

      const created = await Product.findByPk(product.item_id, {
        include: [{ model: Category, as: "category" }],
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getAllProducts(req, res) {
    try {
      const { search = "", category_id, active } = req.query;
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

      if (active !== undefined) {
        where.active = String(active) === "true";
      }

      const products = await Product.findAll({
        where,
        include: [{ model: Category, as: "category" }],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [{ model: Category, as: "category" }],
      });

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const { name, sku, category_id, track_serial, default_unit_price, active } = req.body;

      if (category_id !== undefined && category_id !== null) {
        const cat = await Category.findByPk(category_id);
        if (!cat) {
          return res.status(404).json({ success: false, message: "Category not found" });
        }
      }

      await product.update({
        ...(name !== undefined ? { name } : {}),
        ...(sku !== undefined ? { sku: sku ?? null } : {}),
        ...(category_id !== undefined ? { category_id: category_id ?? null } : {}),
        ...(track_serial !== undefined ? { track_serial: Boolean(track_serial) } : {}),
        ...(default_unit_price !== undefined ? { default_unit_price } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      });

      const updated = await Product.findByPk(id, {
        include: [{ model: Category, as: "category" }],
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      await product.destroy();
      return res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },
};

module.exports = productController;
