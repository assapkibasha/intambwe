import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, RefreshCw, X } from 'lucide-react';
import stockOutService from '../../../services/stockOutService';
import productService from '../../../services/productService';

export default function StockOutPage() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    issued_date: new Date().toISOString().slice(0, 10),
    issued_to_type: 'other',
    issued_to: '',
    notes: '',
  });

  const [items, setItems] = useState([{ item_id: '', quantity: 1, sn_id: '' }]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await stockOutService.getAllStockOut({ search: search.trim() });
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load stock out records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.reference_number} ${r.issued_to || ''}`.toLowerCase().includes(q));
  }, [rows, search]);

  const openCreate = async () => {
    setForm({
      issued_date: new Date().toISOString().slice(0, 10),
      issued_to_type: 'other',
      issued_to: '',
      notes: '',
    });
    setItems([{ item_id: '', quantity: 1, sn_id: '' }]);
    setShowModal(true);

    try {
      const prodRes = await productService.getAllProducts({ active: true });
      setProducts(prodRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    }
  };

  const onAddRow = () => setItems((prev) => [...prev, { item_id: '', quantity: 1, sn_id: '' }]);
  const onRemoveRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e) => {
    e.preventDefault();
    const cleaned = items
      .filter((it) => it.item_id)
      .map((it) => ({
        item_id: it.item_id,
        quantity: Number(it.quantity),
        sn_id: it.sn_id.trim() || null,
      }));

    if (cleaned.length === 0) {
      setError('At least one item is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await stockOutService.createStockOut({
        issued_date: form.issued_date,
        issued_to_type: form.issued_to_type,
        issued_to: form.issued_to || null,
        notes: form.notes || null,
        items: cleaned,
      });
      setShowModal(false);
      await load();
    } catch (e2) {
      setError(e2.message || 'Failed to create stock out');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock Out</h2>
          <p className="text-sm text-gray-500">Issue stock to students/departments</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Stock Out
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stock out..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={load} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Apply
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Ref</th>
                <th className="text-left font-semibold px-4 py-3">Issued To</th>
                <th className="text-left font-semibold px-4 py-3">Type</th>
                <th className="text-left font-semibold px-4 py-3">Issued Date</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No records</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.stock_outId} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{r.reference_number}</td>
                    <td className="px-4 py-3 text-gray-700">{r.issued_to || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.issued_to_type}</td>
                    <td className="px-4 py-3 text-gray-600">{String(r.issued_date).slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">New Stock Out</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date</label>
                  <input
                    type="date"
                    value={form.issued_date}
                    onChange={(e) => setForm((p) => ({ ...p, issued_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued To Type</label>
                  <select
                    value={form.issued_to_type}
                    onChange={(e) => setForm((p) => ({ ...p, issued_to_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">student</option>
                    <option value="department">department</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                  <input
                    value={form.issued_to}
                    onChange={(e) => setForm((p) => ({ ...p, issued_to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left font-semibold px-4 py-3">Product</th>
                      <th className="text-left font-semibold px-4 py-3">Qty</th>
                      <th className="text-left font-semibold px-4 py-3">SN (if needed)</th>
                      <th className="text-right font-semibold px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const p = products.find((x) => x.item_id === it.item_id);
                      return (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <select
                              value={it.item_id}
                              onChange={(e) => {
                                const item_id = e.target.value;
                                const prod = products.find((x) => x.item_id === item_id);
                                setItems((prev) =>
                                  prev.map((row, i) =>
                                    i === idx
                                      ? {
                                          ...row,
                                          item_id,
                                          quantity: prod?.track_serial ? 1 : row.quantity,
                                        }
                                      : row
                                  )
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {products.map((prod) => (
                                <option key={prod.item_id} value={prod.item_id}>
                                  {prod.name} ({prod.item_id})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={it.quantity}
                              disabled={Boolean(p?.track_serial)}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, quantity: e.target.value } : row))
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={it.sn_id}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, sn_id: e.target.value } : row))
                                )
                              }
                              placeholder={p?.track_serial ? 'Required' : 'Optional'}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => onRemoveRow(idx)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                              disabled={items.length === 1}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Add Row
                </button>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
