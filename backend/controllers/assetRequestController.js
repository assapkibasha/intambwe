const { AssetRequest, Employee, InventoryItem, sequelize } = require('../model'); // Update your model imports
const stockController = require('../controllers/stockController'); // Import for stockOut logic

const assetRequestController = {

    // 1. EMPLOYEE ENDPOINT: Submit a new request
    async createRequest(req, res) {
        try {
            const { item_id, quantity, justification } = req.body;
            // Assuming req.employee is set by the authenticateToken middleware
            const requester_id = req.employee.emp_id;

            const newRequest = await AssetRequest.create({
                requester_id,
                item_id,
                quantity,
                justification,
                status: 'Pending'
            });

            return res.status(201).json({ success: true, message: 'Asset request submitted successfully.', data: newRequest });
        } catch (error) {
            console.error('Error creating asset request:', error);
            return res.status(500).json({ success: false, message: 'Failed to create asset request.', error: error.message });
        }
    },

    // 2. EMPLOYEE ENDPOINT: View their own requests (for History Tab)
    async getMyRequests(req, res) {
        try {
            const requester_id = req.employee.emp_id;

            const requests = await AssetRequest.findAll({
                where: { requester_id },
                include: [
                    { model: InventoryItem, as: 'RequestedItem', attributes: ['name', 'sku'] }
                ],
                order: [['requested_at', 'DESC']]
            });

            return res.status(200).json({ success: true, data: requests });
        } catch (error) {
            console.error('Error fetching employee requests:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch requests.', error: error.message });
        }
    },
    
    // 3. MANAGER ENDPOINT: List ALL pending requests
    async getAllPendingRequests(req, res) {
        try {
            const requests = await AssetRequest.findAll({
                where: { status: 'Pending' },
                include: [
                    { model: Employee, as: 'Requester', attributes: ['emp_name', 'emp_email'] },
                    { model: InventoryItem, as: 'RequestedItem', attributes: ['name', 'sku', 'quantity_on_hand'] }
                ],
                order: [['requested_at', 'ASC']]
            });

            return res.status(200).json({ success: true, data: requests });
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch pending requests.', error: error.message });
        }
    },

    // 4. MANAGER ENDPOINT: Approve or Reject a request (The Core Logic)
    async processRequest(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { action } = req.body; // 'approve' or 'reject'
            const processor_id = req.employee.emp_id;

            const request = await AssetRequest.findByPk(id, { transaction: t });
            if (!request) { await t.rollback(); return res.status(404).json({ success: false, message: 'Request not found.' }); }
            if (request.status !== 'Pending') { await t.rollback(); return res.status(400).json({ success: false, message: `Request already ${request.status}.` }); }

            let newStatus = action === 'approve' ? 'Approved' : 'Rejected';
            
            if (newStatus === 'Approved') {
                // Check stock availability (Assuming you implement InventoryItem model)
                const item = await InventoryItem.findByPk(request.item_id, { transaction: t, lock: t.LOCK.UPDATE });
                if (!item || item.quantity_on_hand < request.quantity) {
                    await t.rollback();
                    return res.status(400).json({ success: false, message: 'Insufficient stock to fulfill request.' });
                }

                // Call the stockOut logic to update inventory and record transaction
                // We must use a separate transaction for the stock update if it's complex, 
                // or integrate it here. For simplicity, we model the action here:
                item.quantity_on_hand -= request.quantity;
                await item.save({ transaction: t });

                await stockController.recordTransaction({
                    item_id: request.item_id,
                    type: 'out',
                    quantity: request.quantity,
                    performed_by: processor_id,
                    reference: `ASSET_REQ_${request.request_id}`,
                    note: `Fulfilled request by Employee ID ${request.requester_id}`
                }, t); // Assuming you add a recordTransaction method to stockController

                newStatus = 'Confirmed'; // Set to Confirmed if stock-out is successful
            }

            await request.update({
                status: newStatus,
                processed_by_id: processor_id,
                processed_date: new Date(),
            }, { transaction: t });

            await t.commit();
            return res.status(200).json({ success: true, message: `Request ${newStatus} successfully.`, data: request });
        } catch (error) {
            await t.rollback();
            console.error('Error processing asset request:', error);
            return res.status(500).json({ success: false, message: 'Failed to process request.', error: error.message });
        }
    }
};

module.exports = assetRequestController;