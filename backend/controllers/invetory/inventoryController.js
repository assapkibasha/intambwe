// controllers/invetory/inventoryController.js
const { 
    InventoryItem, 
    Category, 
    Supplier 
} = require('../../model/index'); 

const inventoryController = {
    // 1. CREATE: Add a new Inventory Item (Product)
    async createInventoryItem(req, res) {
        try {
            const { 
                sku, name, description, category_id, 
                default_supplier_id, unit_of_measure, is_serialized, 
                reorder_point
            } = req.body;

            if (!sku || !name || !category_id) {
                return res.status(400).json({ success: false, message: 'SKU, Name, and Category ID are required.' });
            }

            // Check if category and supplier exist
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Specified Category not found.' });
            }
            if (default_supplier_id) {
                const supplier = await Supplier.findByPk(default_supplier_id);
                if (!supplier) {
                    return res.status(404).json({ success: false, message: 'Specified Supplier not found.' });
                }
            }

            const newItem = await InventoryItem.create({
                sku, name, description, category_id, 
                default_supplier_id, unit_of_measure, 
                is_serialized: is_serialized !== undefined ? is_serialized : true,
                reorder_point
            });

            return res.status(201).json({ success: true, message: 'Inventory Item created successfully.', data: newItem });
        } catch (error) {
            console.error('Error creating Inventory Item:', error);
            // Check for unique constraint violation on SKU
            if (error.name === 'SequelizeUniqueConstraintError') {
                 return res.status(409).json({ success: false, message: 'SKU must be unique.', error: error.errors[0].message });
            }
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    
    // 2. READ ALL: List all Inventory Items
    async listInventoryItems(req, res) {
        try {
            const items = await InventoryItem.findAll({
                include: [
                    { model: Category, as: 'category', attributes: ['name'] },
                    { model: Supplier, as: 'defaultSupplier', attributes: ['supplier_name'] }
                ],
                order: [['name', 'ASC']]
            });
            return res.status(200).json({ success: true, data: items });
        } catch (error) {
            console.error('Error listing Inventory Items:', error);
            return res.status(500).json({ success: false, message: 'Failed to retrieve inventory items.', error: error.message });
        }
    },
    
    // 3. READ ONE: Get Item by ID
    async getInventoryItemById(req, res) {
        try {
            const item = await InventoryItem.findByPk(req.params.id, {
                include: [
                    { model: Category, as: 'category', attributes: ['name'] },
                    { model: Supplier, as: 'defaultSupplier', attributes: ['supplier_name'] }
                ]
            });
            if (!item) {
                return res.status(404).json({ success: false, message: 'Inventory Item not found.' });
            }
            return res.status(200).json({ success: true, data: item });
        } catch (error) {
            console.error('Error fetching Inventory Item:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    
    // 4. UPDATE: Update Item details
    async updateInventoryItem(req, res) {
        try {
            const [updated] = await InventoryItem.update(req.body, { where: { item_id: req.params.id } });
            if (updated) {
                const updatedItem = await InventoryItem.findByPk(req.params.id);
                return res.status(200).json({ success: true, message: 'Inventory Item updated successfully.', data: updatedItem });
            }
            return res.status(404).json({ success: false, message: 'Inventory Item not found or no changes made.' });
        } catch (error) {
            console.error('Error updating Inventory Item:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    
    // 5. DELETE: Delete an Item
    async deleteInventoryItem(req, res) {
        try {
            // Check for foreign key constraints (Stock, Requests, etc.) before deleting
            const deleted = await InventoryItem.destroy({ where: { item_id: req.params.id } });
            if (deleted) {
                return res.status(200).json({ success: true, message: 'Inventory Item deleted successfully.' });
            }
            return res.status(404).json({ success: false, message: 'Inventory Item not found.' });
        } catch (error) {
            console.error('Error deleting Inventory Item:', error);
            return res.status(500).json({ success: false, message: 'Cannot delete item due to existing stock units, transactions, or requests linked to it.', error: error.message });
        }
    }
};

module.exports = inventoryController;