const { sequelize } = require('../../model');
const { AssetRequest, InventoryItem, StockTransaction, Employee } = require('../../model');

// =========================================================
// A. Requester Actions
// =========================================================

// 1. CREATE: Employee submits a new asset request
exports.createRequest = async (req, res) => {
    try {
        const requester_id = req.employee.emp_id;
        
        // TEMPORARY FIX: OMIT 'request_type' to bypass the SequelizeDatabaseError
        const { item_id, quantity_requested, purpose, destination_location, request_type } = req.body;
        
        // Simple check: Ensure item exists
        const item = await InventoryItem.findByPk(item_id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Requested inventory item not found.' });
        }

        // Object for Sequelize Create (OMITTING request_type)
        const newRequest = await AssetRequest.create({
            requester_id,
            item_id,
            quantity_requested,
            purpose,
            destination_location,
            // request_type, // <--- TEMPORARILY COMMENTED OUT/REMOVED
            status: 'pending' 
        });

        return res.status(201).json({ success: true, message: 'Asset request submitted successfully for review.', data: newRequest });
    } catch (error) {
        // This is where the Sequelize error currently lands
        console.error('Error creating asset request:', error); 
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// 2. READ: Requester views their own requests
exports.listMyRequests = async (req, res) => {
    try {
        // FIX APPLIED HERE: Changed req.user.emp_id to req.employee.emp_id
        const requester_id = req.employee.emp_id; // Get requester from authenticated token
        
        const requests = await AssetRequest.findAll({
            where: { requester_id },
            order: [['createdAt', 'DESC']],
            include: [
                // Include the requested item details
                { model: InventoryItem, as: 'requestedItem', attributes: ['name', 'sku', 'unit_of_measure'] } ,
                // Include the reviewer details (optional, but good for completeness)
                { model: Employee, as: 'reviewer', attributes: ['emp_id', 'full_name'] }
            ]
        });

        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Error listing user requests:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


// =========================================================
// B. Inventory Manager Actions
// =========================================================

// 3. READ ALL: Manager views all pending/approved requests
exports.listAllRequests = async (req, res) => {
    try {
        // Manager can view all requests, perhaps filter by status 'pending'
        const { status = 'pending' } = req.query; 

        const requests = await AssetRequest.findAll({
            where: { status },
            order: [['createdAt', 'ASC']], // Oldest first
            include: [
                { model: InventoryItem, as: 'requestedItem', attributes: ['name', 'sku', 'unit_of_measure', 'current_stock'] },
                { model: Employee, as: 'requester', attributes: ['emp_id', 'full_name'] }, // Include who made the request
                { model: Employee, as: 'reviewer', attributes: ['emp_id', 'full_name'] } // Include who reviewed the request
            ]
        });

        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Error listing all requests:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// 4. UPDATE: Manager approves or rejects a request (CORE LOGIC)
exports.reviewAndIssueRequest = async (req, res) => {
    const requestId = req.params.id;
    // FIX APPLIED HERE: Changed req.user.emp_id to req.employee.emp_id
    const reviewerId = req.employee.emp_id; // The manager reviewing it
    const { action, quantity_issued } = req.body; // action can be 'approve' or 'reject'

    // Sequelize Transaction: Ensures all changes (request status, item stock, transaction log) happen together or none at all. 
    const t = await sequelize.transaction();

    try {
        const request = await AssetRequest.findByPk(requestId, { transaction: t });
        
        // Validation: Check if request exists and is still pending
        if (!request || request.status !== 'pending') {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Request not found or not in pending status.' });
        }

        if (action === 'reject') {
            // Reject: Update status, reviewer, and review date
            await request.update({
                status: 'rejected',
                reviewed_by: reviewerId,
                review_date: new Date(),
            }, { transaction: t });
            
            await t.commit();
            return res.status(200).json({ success: true, message: `Request #${requestId} rejected.` });
        } 
        
        // --- Approval/Issuance Logic ---
        
        if (action === 'approve') {
            const requestedItem = await InventoryItem.findByPk(request.item_id, { transaction: t });
            // Use issued quantity if provided, otherwise default to the requested quantity
            const issueQuantity = quantity_issued || request.quantity_requested; 

            // Input Validation: Ensure issued quantity is not zero or negative
            if (issueQuantity <= 0) {
                await t.rollback();
                return res.status(400).json({ success: false, message: 'Issue quantity must be a positive number.' });
            }

            // Check if stock is sufficient
            if (requestedItem.current_stock < issueQuantity) {
                await t.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for item ${requestedItem.name}. Current: ${requestedItem.current_stock}, Requested/Issued: ${issueQuantity}` 
                });
            }

            // 1. Update Inventory Item (Stock OUT)
            const newStock = requestedItem.current_stock - issueQuantity;
            await requestedItem.update({ current_stock: newStock }, { transaction: t });

            // 2. Create StockTransaction (Ledger Entry)
            await StockTransaction.create({
                item_id: requestedItem.item_id,
                quantity: -issueQuantity, // Negative value for stock OUT
                type: 'OUT_ISSUE', 
                source_document_id: request.request_id,
                notes: `Issued to Employee #${request.requester_id} for purpose: ${request.purpose}`,
                current_stock_snapshot: newStock,
            }, { transaction: t });

            // 3. Update AssetRequest status and details
            await request.update({
                status: 'issued', // Final status after successful stock movement
                quantity_issued: issueQuantity,
                reviewed_by: reviewerId,
                review_date: new Date(),
            }, { transaction: t });

            await t.commit();
            return res.status(200).json({ 
                success: true, 
                message: `Request #${requestId} approved and ${issueQuantity} unit(s) issued.`,
                data: request 
            });
        }
        
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Invalid action specified.' });

    } catch (error) {
        await t.rollback();
        console.error('Error reviewing and issuing request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during request review.' });
    }
};