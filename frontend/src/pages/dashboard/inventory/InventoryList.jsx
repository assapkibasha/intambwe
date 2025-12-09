import React, { useEffect, useState } from 'react';
import inventoryService from '../../../services/inventoryService';
import { useEmployeeAuth } from '../../../contexts/EmployeeAuthContext';

export default function InventoryList() {
  const { employee } = useEmployeeAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', stock_keeping_unit: '', quantity: 0, unit_price: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const resp = await inventoryService.listItems({ limit: 100 });
      setItems(resp.data || resp);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await inventoryService.createItem({ ...form, quantity: Number(form.quantity) });
      setForm({ name: '', stock_keeping_unit: '', quantity: 0, unit_price: '', description: '' });
      await load();
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  };

  const handleRequest = async (item) => {
    const qty = parseInt(prompt('Quantity to request', '1'), 10);
    if (!qty || qty <= 0) return;
    try {
      await inventoryService.createRequest({ item_id: item.item_id, quantity_requested: qty });
      alert('Request created');
    } catch (err) {
      alert(err.message || 'Request failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Inventory</h2>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-3">Add Item</h3>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="p-2 border" required />
          <input name="stock_keeping_unit" value={form.stock_keeping_unit} onChange={handleChange} placeholder="SKU / Stock code" className="p-2 border" />
          <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" type="number" className="p-2 border" />
          <input name="unit_price" value={form.unit_price} onChange={handleChange} placeholder="Unit price" className="p-2 border" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-2 border col-span-1 sm:col-span-2" />
          <div className="col-span-1 sm:col-span-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Item</button>
          </div>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-3">Items</h3>
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Name</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.item_id} className="border-t">
                  <td className="py-2">{it.name}</td>
                  <td>{it.stock_keeping_unit}</td>
                  <td>{it.quantity}</td>
                  <td>{it.unit_price}</td>
                  <td>
                    <button onClick={() => handleRequest(it)} className="bg-emerald-600 text-white px-3 py-1 rounded">Request</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
