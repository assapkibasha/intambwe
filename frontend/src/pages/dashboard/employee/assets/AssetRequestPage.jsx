import React, { useState, useEffect } from 'react';
// 💡 NOTE: Renamed service import for clarity
import { getMyAssetRequests, createAssetRequest, getAvailableAssets } from '../../../../services/assetService'; 
import AssetRequestForm from '../../AssetRequestForm';

const AssetRequestPage = () => {
    const [currentTab, setCurrentTab] = useState('inventory'); // 'inventory' or 'history'
    const [availableAssets, setAvailableAssets] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [isLoading, setIsLoading] = useState({ inventory: true, history: true });
    const [selectedAsset, setSelectedAsset] = useState(null); // Asset to request in the modal

    // --- Data Fetching Functions ---

    const loadInventory = async () => {
        setIsLoading(prev => ({ ...prev, inventory: true }));
        try {
            // MOCK: Fetches static asset inventory data
            const data = await getAvailableAssets(); 
            setAvailableAssets(data);
        } catch (err) {
            console.error('Failed to fetch asset inventory:', err);
        } finally {
            setIsLoading(prev => ({ ...prev, inventory: false }));
        }
    };

    const loadRequestsHistory = async () => {
        setIsLoading(prev => ({ ...prev, history: true }));
        try {
            // MOCK: Fetches static request history data
            const data = await getMyAssetRequests(); 
            setMyRequests(data);
        } catch (err) {
            console.error('Failed to fetch request history:', err);
        } finally {
            setIsLoading(prev => ({ ...prev, history: false }));
        }
    };
    
    // Initial data load on mount
    useEffect(() => {
        loadInventory();
        loadRequestsHistory();
    }, []);

    // --- Request Handling ---

    const handleOpenRequestModal = (asset) => {
        setSelectedAsset(asset);
    };

    const handleCloseRequestModal = () => {
        setSelectedAsset(null);
    };

    const handleNewRequestSubmission = async (formData) => {
        handleCloseRequestModal(); // Close modal immediately
        
        try {
            await createAssetRequest(formData); 
            alert(`Request for ${formData.asset_name} submitted! Status: Pending.`);
            // After successful submission, reload history to see the new request
            loadRequestsHistory(); 
        } catch (err) {
            alert('Failed to submit request. Please check the console.');
        }
    };

    // --- Render Functions ---

    const renderInventoryTable = () => {
        if (isLoading.inventory) return <p className="text-center py-8">Loading available assets...</p>;
        if (availableAssets.length === 0) return <p className="text-center py-8">No assets are currently available for request.</p>;

        return (
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Available</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {availableAssets.map((asset) => (
                            <tr key={asset.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{asset.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.unit_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.stock_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleOpenRequestModal(asset)}
                                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                                    >
                                        Request Asset
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderRequestsHistoryTable = () => {
        if (isLoading.history) return <p className="text-center py-8">Loading request history...</p>;
        if (myRequests.length === 0) return <p className="text-center py-8">You have no asset request history.</p>;

        return (
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myRequests.map((req) => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{req.asset_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{req.quantity}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                                    req.status === 'Confirmed' ? 'text-blue-600' :
                                    req.status === 'Approved' ? 'text-green-600' :
                                    req.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                                }`}>{req.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(req.requested_on).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">🏢 Assets Request Portal</h1>
            <p className="text-gray-600">Request new assets and track the status of your submissions.</p>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setCurrentTab('inventory')}
                    className={`py-2 px-4 text-lg font-medium transition-colors ${
                        currentTab === 'inventory' 
                        ? 'border-b-4 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Available Assets (Inventory)
                </button>
                <button
                    onClick={() => setCurrentTab('history')}
                    className={`py-2 px-4 text-lg font-medium transition-colors ${
                        currentTab === 'history' 
                        ? 'border-b-4 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    My Request History
                </button>
            </div>

            {/* Content Display */}
            <div className="bg-white shadow-lg p-6 rounded-xl min-h-[400px]">
                {currentTab === 'inventory' ? renderInventoryTable() : renderRequestsHistoryTable()}
            </div>

            {/* Request Modal (Conditional Rendering) */}
            {selectedAsset && (
                <AssetRequestForm
                    asset={selectedAsset}
                    onSubmit={handleNewRequestSubmission}
                    onClose={handleCloseRequestModal}
                />
            )}
        </div>
    );
};

export default AssetRequestPage;