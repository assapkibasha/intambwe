const { Category } = require("../../model");

const categoryController = {
  async createCategory(req, res) {
    try {
      const { name, description, parent_id } = req.body;

      if (!name || String(name).trim().length === 0) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }

      const existing = await Category.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Category already exists" });
      }

      const category = await Category.create({
        name,
        description: description ?? null,
        parent_id: parent_id ?? null,
      });

      return res.status(201).json({ success: true, data: category });
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll({ order: [["name", "ASC"]] });
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category id" });
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category id" });
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      const { name, description, parent_id } = req.body;

      if (name !== undefined) {
        if (!name || String(name).trim().length === 0) {
          return res.status(400).json({ success: false, message: "Name cannot be empty" });
        }

        if (name !== category.name) {
          const existing = await Category.findOne({ where: { name } });
          if (existing) {
            return res.status(409).json({ success: false, message: "Category name already exists" });
          }
        }
      }

      await category.update({
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description ?? null } : {}),
        ...(parent_id !== undefined ? { parent_id: parent_id ?? null } : {}),
      });

      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid category id" });
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }

      await category.destroy();
      return res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  },
};

module.exports = categoryController;
