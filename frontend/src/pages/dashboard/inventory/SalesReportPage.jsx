import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, RefreshCw, X, Eye } from 'lucide-react';
import salesService from '../../../services/salesService';
import productService from '../../../services/productService';

export default function SalesReportPage() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    sale_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [items, setItems] = useState([{ item_id: '', quantity: 1, sn_id: '', unit_price: 0, discount: 0, tax: 0 }]);

  const [viewModal, setViewModal] = useState({ open: false, sale: null, loading: false });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await salesService.getAllSales({ search: search.trim() });
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load sales');
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
    return rows.filter((r) => `${r.sale_number} ${r.customer_name || ''}`.toLowerCase().includes(q));
  }, [rows, search]);

  const openCreate = async () => {
    setForm({
      customer_name: '',
      sale_date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setItems([{ item_id: '', quantity: 1, sn_id: '', unit_price: 0, discount: 0, tax: 0 }]);
    setShowModal(true);

    try {
      const prodRes = await productService.getAllProducts({ active: true });
      setProducts(prodRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    }
  };

  const onAddRow = () => setItems((prev) => [...prev, { item_id: '', quantity: 1, sn_id: '', unit_price: 0, discount: 0, tax: 0 }]);
  const onRemoveRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const calcTotals = () => {
    const cleaned = items.filter((it) => it.item_id);
    const subtotal = cleaned.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);
    const discount_total = cleaned.reduce((sum, it) => sum + Number(it.discount || 0), 0);
    const tax_total = cleaned.reduce((sum, it) => sum + Number(it.tax || 0), 0);
    const grand_total = subtotal - discount_total + tax_total;
    return { subtotal, discount_total, tax_total, grand_total };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const cleaned = items
      .filter((it) => it.item_id)
      .map((it) => ({
        item_id: it.item_id,
        quantity: Number(it.quantity),
        sn_id: it.sn_id.trim() || null,
        unit_price: Number(it.unit_price || 0),
        discount: Number(it.discount || 0),
        tax: Number(it.tax || 0),
      }));

    if (cleaned.length === 0) {
      setError('At least one item is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await salesService.createSale({
        customer_name: form.customer_name || null,
        sale_date: form.sale_date,
        notes: form.notes || null,
        items: cleaned,
      });
      setShowModal(false);
      await load();
    } catch (e2) {
      setError(e2.message || 'Failed to create sale');
    } finally {
      setSaving(false);
    }
  };

  const openView = async (saleId) => {
    try {
      setViewModal({ open: true, sale: null, loading: true });
      const res = await salesService.getSaleById(saleId);
      setViewModal({ open: true, sale: res.data || null, loading: false });
    } catch (e) {
      setError(e.message || 'Failed to load sale');
      setViewModal({ open: false, sale: null, loading: false });
    }
  };

  const totals = calcTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales</h2>
          <p className="text-sm text-gray-500">Sales list and create sales</p>
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
            New Sale
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
              placeholder="Search sales..."
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
                <th className="text-left font-semibold px-4 py-3">Sale #</th>
                <th className="text-left font-semibold px-4 py-3">Customer</th>
                <th className="text-left font-semibold px-4 py-3">Date</th>
                <th className="text-left font-semibold px-4 py-3">Total</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No sales</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.sale_id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{r.sale_number}</td>
                    <td className="px-4 py-3 text-gray-700">{r.customer_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{String(r.sale_date).slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(r.grand_total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openView(r.sale_id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">New Sale</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    value={form.customer_name}
                    onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={form.sale_date}
                    onChange={(e) => setForm((p) => ({ ...p, sale_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                      <th className="text-left font-semibold px-4 py-3">SN</th>
                      <th className="text-left font-semibold px-4 py-3">Unit Price</th>
                      <th className="text-left font-semibold px-4 py-3">Discount</th>
                      <th className="text-left font-semibold px-4 py-3">Tax</th>
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
                                          unit_price: Number(prod?.default_unit_price || 0),
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
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={it.unit_price}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, unit_price: e.target.value } : row))
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={it.discount}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, discount: e.target.value } : row))
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={it.tax}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, tax: e.target.value } : row))
                                )
                              }
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

                <div className="text-sm text-gray-700">
                  Subtotal: {totals.subtotal.toFixed(2)} | Discount: {totals.discount_total.toFixed(2)} | Tax: {totals.tax_total.toFixed(2)} | Total: {totals.grand_total.toFixed(2)}
                </div>
              </div>

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
            </form>
          </div>
        </div>
      )}

      {viewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Sale Details</h3>
              <button onClick={() => setViewModal({ open: false, sale: null, loading: false })} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {viewModal.loading ? (
                <div className="text-center text-gray-500 py-10">Loading...</div>
              ) : !viewModal.sale ? (
                <div className="text-center text-gray-500 py-10">No data</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-500">Sale #</span><div className="font-mono text-gray-800">{viewModal.sale.sale_number}</div></div>
                    <div><span className="text-gray-500">Customer</span><div className="text-gray-800">{viewModal.sale.customer_name || '-'}</div></div>
                    <div><span className="text-gray-500">Date</span><div className="text-gray-800">{String(viewModal.sale.sale_date).slice(0,10)}</div></div>
                    <div><span className="text-gray-500">Total</span><div className="text-gray-800">{Number(viewModal.sale.grand_total || 0).toFixed(2)}</div></div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left font-semibold px-4 py-3">Product</th>
                          <th className="text-left font-semibold px-4 py-3">SN</th>
                          <th className="text-left font-semibold px-4 py-3">Qty</th>
                          <th className="text-left font-semibold px-4 py-3">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewModal.sale.items || []).map((it) => (
                          <tr key={it.sale_item_id} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-gray-800">{it.product?.name || it.item_id}</td>
                            <td className="px-4 py-3 text-gray-600">{it.sn_id || '-'}</td>
                            <td className="px-4 py-3 text-gray-600">{Number(it.quantity || 0)}</td>
                            <td className="px-4 py-3 text-gray-600">{Number(it.unit_price || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
