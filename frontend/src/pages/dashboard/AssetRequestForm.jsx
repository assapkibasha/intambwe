import React, { useState } from 'react';

const units = ["pcs", "kits", "licenses", "kgs", "liters"];

const AssetRequestForm = ({ asset, onSubmit, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [justification, setJustification] = useState('');
    const [unit, setUnit] = useState(asset.unit_type || units[0]); // Default to asset's unit type

    const handleSubmit = (e) => {
        e.preventDefault();
        if (quantity < 1 || justification.length < 10) {
            alert("Please provide a quantity of 1 or more and a detailed justification (min 10 chars).");
            return;
        }

        const requestData = {
            asset_id: asset.id,
            asset_name: asset.name,
            quantity,
            unit,
            justification,
        };
        
        onSubmit(requestData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Request: {asset.name}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Quantity and Unit Type */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                                type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                min="1" required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit Type</label>
                            <select
                                id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {units.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Justification */}
                    <div>
                        <label htmlFor="justification" className="block text-sm font-medium text-gray-700">Justification (Why do you need this asset?)</label>
                        <textarea
                            id="justification" value={justification} onChange={(e) => setJustification(e.target.value)}
                            rows="3" required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Explain your need for this asset..."
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">Min 10 characters.</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetRequestForm;