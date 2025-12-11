// controllers/assetCategory/categoryController.js
// We explicitly target index.js to ensure all models are loaded
const { Category, InventoryItem } = require('../../model/index'); 

const categoryController = {
    // 1. CREATE: Add a new Category
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Category Name is required.' });
            }
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {
                return res.status(409).json({ success: false, message: `Category named "${name}" already exists.` });
            }
            const newCategory = await Category.create({ name, description });
            return res.status(201).json({ success: true, message: 'Category created successfully.', data: newCategory });
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    // 2. READ ALL: List all Categories
    async listCategories(req, res) {
        try {
            const categories = await Category.findAll({ 
                order: [['name', 'ASC']],
                // Optional: Count how many items are in each category (requires association setup in models/index.js)
                // include: [{ model: InventoryItem, as: 'items', attributes: [] }], 
                // attributes: { include: [[sequelize.fn("COUNT", sequelize.col("items.item_id")), "itemCount"]] },
                // group: ['Category.category_id']
            });
            return res.status(200).json({ success: true, data: categories });
        } catch (error) {
            console.error('Error listing categories:', error);
            return res.status(500).json({ success: false, message: 'Failed to retrieve categories.', error: error.message });
        }
    },
    // 3. READ ONE: Get Category by ID
    async getCategoryById(req, res) {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found.' });
            }
            return res.status(200).json({ success: true, data: category });
        } catch (error) {
            console.error('Error fetching category:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    // 4. UPDATE: Update Category details
    async updateCategory(req, res) {
        try {
            const [updated] = await Category.update(req.body, { where: { category_id: req.params.id } });
            if (updated) {
                const updatedCategory = await Category.findByPk(req.params.id);
                return res.status(200).json({ success: true, message: 'Category updated successfully.', data: updatedCategory });
            }
            return res.status(404).json({ success: false, message: 'Category not found or no changes made.' });
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    // 5. DELETE: Delete a Category
    async deleteCategory(req, res) {
        try {
            // NOTE: Add a check here if items are linked before deleting
            const deleted = await Category.destroy({ where: { category_id: req.params.id } });
            if (deleted) {
                return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
            }
            return res.status(404).json({ success: false, message: 'Category not found.' });
        } catch (error) {
            console.error('Error deleting category:', error);
            return res.status(500).json({ success: false, message: 'Cannot delete category as it may have existing inventory items linked to it.', error: error.message });
        }
    }
};

module.exports = categoryController;