// controllers/supplier/supplierController.js
const { Supplier } = require('../../model'); 

const supplierController = {
    // 1. CREATE: Add a new Supplier
    async createSupplier(req, res) {
        try {
            const { supplier_name, contact_person, email, phone_number, address } = req.body;
            if (!supplier_name || !email) {
                return res.status(400).json({ success: false, message: 'Supplier Name and Email are required.' });
            }
            const existingSupplier = await Supplier.findOne({ where: { supplier_name } });
            if (existingSupplier) {
                return res.status(409).json({ success: false, message: `Supplier named "${supplier_name}" already exists.` });
            }
            const newSupplier = await Supplier.create({ supplier_name, contact_person, email, phone_number, address });
            return res.status(201).json({ success: true, message: 'Supplier created successfully.', data: newSupplier });
        } catch (error) {
            console.error('Error creating supplier:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    // 2. READ ALL: List all Suppliers
    async listSuppliers(req, res) {
        try {
            const suppliers = await Supplier.findAll({ order: [['supplier_name', 'ASC']] });
            return res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            console.error('Error listing suppliers:', error);
            return res.status(500).json({ success: false, message: 'Failed to retrieve suppliers.', error: error.message });
        }
    },
    // 3. READ ONE: Get Supplier by ID
    async getSupplierById(req, res) {
        try {
            const supplier = await Supplier.findByPk(req.params.id);
            if (!supplier) {
                return res.status(404).json({ success: false, message: 'Supplier not found.' });
            }
            return res.status(200).json({ success: true, data: supplier });
        } catch (error) {
            console.error('Error fetching supplier:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    // 4. UPDATE: Update Supplier details
    async updateSupplier(req, res) {
        try {
            const [updated] = await Supplier.update(req.body, { where: { supplier_id: req.params.id } });
            if (updated) {
                const updatedSupplier = await Supplier.findByPk(req.params.id);
                return res.status(200).json({ success: true, message: 'Supplier updated successfully.', data: updatedSupplier });
            }
            return res.status(404).json({ success: false, message: 'Supplier not found or no changes made.' });
        } catch (error) {
            console.error('Error updating supplier:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
        }
    },
    // 5. DELETE: Delete a Supplier
    async deleteSupplier(req, res) {
        try {
            const deleted = await Supplier.destroy({ where: { supplier_id: req.params.id } });
            if (deleted) {
                return res.status(200).json({ success: true, message: 'Supplier deleted successfully.' });
            }
            return res.status(404).json({ success: false, message: 'Supplier not found.' });
        } catch (error) {
            console.error('Error deleting supplier:', error);
            return res.status(500).json({ success: false, message: 'Cannot delete supplier due to existing inventory or stock records.', error: error.message });
        }
    }
};

module.exports = supplierController;