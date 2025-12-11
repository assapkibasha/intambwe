// controllers/inventory/StockTransactionController.js

const { StockTransaction, InventoryItem } = require('../../model'); // Assuming your model path

// Function to list all stock transactions
exports.listStockTransactions = async (req, res) => {
    try {
        const transactions = await StockTransaction.findAll({
            // Include related InventoryItem data
            include: [{
                model: InventoryItem, 
                as: 'item', 
                attributes: ['item_id', 'name', 'unit_of_measure']
            }],
            order: [['createdAt', 'DESC']] // Show most recent transactions first
        });

        return res.status(200).json({
            success: true,
            message: "Stock transactions retrieved successfully.",
            data: transactions
        });
    } catch (error) {
        console.error("Error retrieving stock transactions:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Function to get a single stock transaction by ID
exports.getStockTransactionById = async (req, res) => {
    try {
        const transaction = await StockTransaction.findByPk(req.params.id, {
            include: [{
                model: InventoryItem,
                as: 'item',
                attributes: ['item_id', 'name', 'unit_of_measure']
            }]
        });

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Stock transaction not found." });
        }

        return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        console.error("Error retrieving stock transaction:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// NOTE: We generally DO NOT include create, update, or delete functions 
// because transactions must only be created automatically by the system
// when a stock-in, stock-out, or adjustment document is finalized.