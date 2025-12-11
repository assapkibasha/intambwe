// controllers/stockIn/stockDetailController.js

const { sequelize } = require('../../model'); // Ensure you import sequelize
const { StockIn, StockDetail, InventoryItem } = require('../../model');
const { validateStockDetails } = require('../../validators/stockDetailValidator');

// Helper to check if item IDs exist (Assuming you already have this)
const checkItemExistence = async (itemIds) => {
    const foundItems = await InventoryItem.findAll({
        where: { item_id: itemIds },
        attributes: ['item_id', 'name', 'unit_of_measure']
    });
    return foundItems.map(item => item.item_id);
};

exports.createStockDetails = async (req, res) => {
    const stockInId = req.params.id; // From the route /stock-in/:id/details
    const detailsData = req.body;
    
    // 1. Initial Validation (Existence & Schema)
    if (!detailsData || !Array.isArray(detailsData) || detailsData.length === 0) {
        return res.status(400).json({ success: false, message: 'Request body must be a non-empty array of stock detail items.' });
    }

    try {
        // Check if the StockIn document exists and is still a draft
        const stockInDocument = await StockIn.findByPk(stockInId);
        if (!stockInDocument) {
            return res.status(404).json({ success: false, message: `Stock-In document with ID ${stockInId} not found.` });
        }
        // Ensure details can only be added to a 'draft' document
        if (stockInDocument.status !== 'draft') {
            return res.status(400).json({ success: false, message: `Cannot add details to a document with status: ${stockInDocument.status}.` });
        }

        // 2. Data Validation
        const validationResult = validateStockDetails(detailsData);
        if (!validationResult.isValid) {
            return res.status(400).json({ success: false, message: "Validation failed for one or more items", errors: validationResult.errors });
        }

        // 3. Foreign Key Validation (Item Existence)
        const itemIds = detailsData.map(d => d.item_id);
        const existingItemIds = await checkItemExistence(itemIds);
        
        const nonExistentItem = itemIds.find(id => !existingItemIds.includes(id));
        if (nonExistentItem) {
            return res.status(404).json({ success: false, message: `Inventory Item ID ${nonExistentItem} not found` });
        }

        // Map item details for lookup and response
        const itemDetailsMap = new Map(existingItemIds.map(id => {
            const item = foundItems.find(i => i.item_id === id);
            return [id, item];
        }));

        // 4. TRANSACTION START: Ensure Atomicity 
        const result = await sequelize.transaction(async (t) => {
            
            // Prepare data for bulk creation
            const itemsToCreate = detailsData.map(detail => ({
                ...detail,
                stock_in_id: stockInId // Link to the header
            }));

            // A. Create the StockDetail records
            const createdDetails = await StockDetail.bulkCreate(itemsToCreate, { transaction: t });
            
            // B. Prepare the inventory updates
            const updateMap = new Map(); // Map to hold total quantities for each item_id
            
            detailsData.forEach(detail => {
                const currentTotal = updateMap.get(detail.item_id) || 0;
                updateMap.set(detail.item_id, currentTotal + detail.quantity_received);
            });

            // C. Update the InventoryItem table (The crucial step for Asset Control)
            const updatePromises = Array.from(updateMap.entries()).map(([itemId, totalQuantity]) => 
                InventoryItem.increment(
                    { current_stock: totalQuantity }, // Increment the current_stock field
                    { 
                        where: { item_id: itemId },
                        transaction: t 
                    }
                )
            );
            
            await Promise.all(updatePromises);
            
            // D. Update the StockIn document status from 'draft' to 'received'
            await stockInDocument.update({ status: 'received' }, { transaction: t });

            // Prepare the response data with item names
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
        });

        // 5. Success Response
        return res.status(201).json({
            success: true,
            message: `${result.length} Stock Detail line item(s) created successfully and inventory updated.`,
            data: result
        });

    } catch (error) {
        console.error("Error creating stock details and updating inventory:", error);
        // If an error occurs, the transaction automatically rolls back.
        return res.status(500).json({ success: false, message: "Internal server error during stock receipt process." });
    }
};

// NOTE: You will need to ensure 'foundItems' is defined for the map creation, 
// which means adjusting the 'checkItemExistence' or the try block to use the result of the search.