// Renamed from toolService.js for clarity in "Assets Request" project
// MOCK DATA: Simulates data received from the backend

// Mock list of all available assets (from the proposed /api/assets endpoint)
const MOCK_ASSETS_INVENTORY = [
    { id: 101, name: "Lenovo ThinkPad X1", unit_type: "pcs", stock_count: 15, description: "High-performance laptop for developers." },
    { id: 102, name: "27-inch 4K Monitor", unit_type: "pcs", stock_count: 35, description: "Standard issue external display." },
    { id: 103, name: "Office Stationery Kit", unit_type: "kits", stock_count: 200, description: "Pens, paper, notebooks, etc." },
    { id: 104, name: "Project Management Software License", unit_type: "licenses", stock_count: 50, description: "Annual license for PM tool." },
];

// Mock list of the current employee's requests (from the proposed /api/tools/requests/me endpoint)
const MOCK_MY_REQUESTS = [
    { id: 1, asset_name: "Lenovo ThinkPad X1", quantity: 1, status: "Confirmed", requested_on: "2025-11-20T10:00:00Z" },
    { id: 2, asset_name: "27-inch 4K Monitor", quantity: 2, status: "Approved", requested_on: "2025-12-01T15:30:00Z" },
    { id: 3, asset_name: "Office Stationery Kit", quantity: 1, status: "Pending", requested_on: "2025-12-08T09:45:00Z" },
    { id: 4, asset_name: "Specialized Testing Meter", quantity: 1, status: "Rejected", requested_on: "2025-12-05T11:20:00Z" },
];


// --- API Simulation Functions ---

/**
 * MOCK: Submits a new asset request.
 */
export const createAssetRequest = async (requestData) => {
    return new Promise(resolve => {
        console.log("MOCK: Submitting new asset request:", requestData);
        // Simulate a delay and a successful response
        setTimeout(() => {
            resolve({ status: 'success', message: 'Request submitted. Status: Pending.' });
        }, 500);
    });
};

/**
 * MOCK: Fetches all available assets from the inventory.
 */
export const getAvailableAssets = async () => {
    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            resolve(MOCK_ASSETS_INVENTORY);
        }, 300);
    });
};


/**
 * MOCK: Fetches all asset requests for the currently logged-in user.
 */
export const getMyAssetRequests = async () => {
    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            resolve(MOCK_MY_REQUESTS);
        }, 700);
    });
};

// NOTE: When the backend is ready, replace the body of these functions
// with actual Axios calls using the 'api' instance.