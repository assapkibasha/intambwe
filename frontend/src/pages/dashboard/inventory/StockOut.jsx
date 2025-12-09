import React, { useEffect, useState } from 'react';
import inventoryService from '../../../services/inventoryService';

export default function StockOut() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ item_id: '', quantity: 1, reference: '', note: '' });

  const load = async () => {
    setLoading(true);
    try {
      const resp = await inventoryService.listItems({ limit: 200 });
      setItems(resp.data || resp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.stockOut({ item_id: form.item_id, quantity: Number(form.quantity), reference: form.reference, note: form.note });
      alert('Stocked out');
      setForm({ item_id: '', quantity: 1, reference: '', note: '' });
      await load();
    } catch (err) {
      alert(err.message || 'Stock out failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Stock Out</h2>

      <div className="bg-white p-4 rounded shadow">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select name="item_id" value={form.item_id} onChange={handleChange} className="p-2 border" required>
            <option value="">Select item</option>
            {items.map(it => <option key={it.item_id} value={it.item_id}>{it.name} ({it.stock_keeping_unit || ''})</option>)}
          </select>
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="p-2 border" required />
          <input name="reference" value={form.reference} onChange={handleChange} placeholder="Reference" className="p-2 border" />
          <input name="note" value={form.note} onChange={handleChange} placeholder="Note" className="p-2 border" />
          <div className="sm:col-span-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded">Stock Out</button>
          </div>
        </form>
      </div>
    </div>
  );
}
