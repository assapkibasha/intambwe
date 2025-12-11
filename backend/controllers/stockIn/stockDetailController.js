// controllers/stockIn/stockDetailController.js

const { sequelize } = require('../../model');
// Add StockTransaction to the imports
const { StockIn, StockDetail, InventoryItem, StockTransaction } = require('../../model'); 
const { validateStockDetails } = require('../../validators/stockDetailValidator');

exports.createStockDetails = async (req, res) => {
    const stockInId = req.params.id;
    const detailsData = req.body;
    
    // ... (1. Initial Validation and 2. Data Validation remain the same) ...
    if (!detailsData || !Array.isArray(detailsData) || detailsData.length === 0) {
        return res.status(400).json({ success: false, message: 'Request body must be a non-empty array of stock detail items.' });
    }

    try {
        // ... (StockIn existence and 'draft' status checks remain the same) ...
        const stockInDocument = await StockIn.findByPk(stockInId);
        if (!stockInDocument) {
            return res.status(404).json({ success: false, message: `Stock-In document with ID ${stockInId} not found.` });
        }
        if (stockInDocument.status !== 'draft') {
            return res.status(400).json({ success: false, message: `Cannot add details to a document with status: ${stockInDocument.status}.` });
        }

        // 2. Data Validation (Skipping for brevity, assuming it works)
        // ...

        // 3. Foreign Key Validation (Item Existence and Lookup)
        const itemIds = detailsData.map(d => d.item_id);
        const foundItems = await InventoryItem.findAll({
            where: { item_id: itemIds },
            attributes: ['item_id', 'name', 'unit_of_measure', 'current_stock'] // Fetch current_stock for snapshot
        });

        if (foundItems.length !== itemIds.length) {
            const foundItemIds = foundItems.map(item => item.item_id);
            const nonExistentItem = itemIds.find(id => !foundItemIds.includes(id));
            return res.status(404).json({ success: false, message: `Inventory Item ID ${nonExistentItem} not found` });
        }

        const itemDetailsMap = new Map(foundItems.map(item => [item.item_id, item.get({ plain: true })]));

        // 4. TRANSACTION START: Atomically create StockDetail, StockTransaction, and update InventoryItem
        const result = await sequelize.transaction(async (t) => {
            
            // A. Create the StockDetail records
            const itemsToCreate = detailsData.map(detail => ({
                ...detail,
                stock_in_id: stockInId
            }));
            const createdDetails = await StockDetail.bulkCreate(itemsToCreate, { transaction: t });
            
            // B. Prepare the inventory updates and transaction records
            const transactionPromises = [];
            const inventoryUpdateMap = new Map(); // Tracks the total quantity added per item

            for (const detail of detailsData) {
                const itemId = detail.item_id;
                const quantity = detail.quantity_received;
                
                // 1. Calculate new stock level (for snapshot)
                const currentItem = itemDetailsMap.get(itemId);
                let currentStock = inventoryUpdateMap.get(itemId) || currentItem.current_stock; // Start with base stock or accumulated stock from previous details
                
                const newStock = currentStock + quantity;

                // 2. Create the StockTransaction record
                transactionPromises.push(StockTransaction.create({
                    item_id: itemId,
                    quantity: quantity, // Positive number for receipt
                    type: 'IN_RECEIPT',
                    source_document_id: stockInId,
                    notes: `Receipt via Stock-In #${stockInId}`,
                    current_stock_snapshot: newStock // The stock level after this movement
                }, { transaction: t }));

                // 3. Update the map for the next detail of the same item
                inventoryUpdateMap.set(itemId, newStock); 
            }
            
            // C. Execute all StockTransaction creations
            await Promise.all(transactionPromises);

            // D. Update the InventoryItem table (Final stock balance update)
            const updatePromises = Array.from(inventoryUpdateMap.entries()).map(([itemId, finalStock]) => 
                InventoryItem.update(
                    { 
                        current_stock: finalStock // Set the final calculated stock level
                    },
                    { 
                        where: { item_id: itemId },
                        transaction: t 
                    }
                )
            );
            
            await Promise.all(updatePromises);
            
            // E. Update the StockIn document status from 'draft' to 'received'
            await stockInDocument.update({ status: 'received' }, { transaction: t });

            // Prepare the response data (same as before)
            const responseData = createdDetails.map(detail => {
                const item = itemDetailsMap.get(detail.item_id);
                return {
                    ...detail.get({ plain: true }),
                    item: {
                        item_id: item.item_id,
                        name: item.name,
                        unit_of_measure: item.unit_of_measure
                    }
                };
            });

            return responseData;
        }); // End of Transaction

        // 5. Success Response
        return res.status(201).json({
            success: true,
            message: `${result.length} Stock Detail line item(s) created, inventory and ledger updated. Document status is now 'received'.`,
            data: result
        });

    } catch (error) {
        console.error("Error creating stock details and updating inventory:", error);
        return res.status(500).json({ success: false, message: "Internal server error during stock receipt process." });
    }
};