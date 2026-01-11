import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import salesService from '../../../services/salesService';

export default function SalesReturnPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState({ open: false, sale: null, loading: false });
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await salesService.getAllSales({ search: search.trim() });
      setSales(res.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => `${s.sale_number} ${s.customer_name || ''}`.toLowerCase().includes(q));
  }, [sales, search]);

  const openReturn = async (saleId) => {
    try {
      setModal({ open: true, sale: null, loading: true });
      setReason('');
      const res = await salesService.getSaleById(saleId);
      const sale = res.data;
      const items = (sale.items || []).map((it) => ({
        item_id: it.item_id,
        sn_id: it.sn_id || '',
        maxQty: Number(it.quantity || 0),
        quantity: 0,
        unit_price: Number(it.unit_price || 0),
        name: it.product?.name || it.item_id,
      }));
      setReturnItems(items);
      setModal({ open: true, sale, loading: false });
    } catch (e) {
      setError(e.message || 'Failed to load sale');
      setModal({ open: false, sale: null, loading: false });
    }
  };

  const submitReturn = async () => {
    if (!modal.sale) return;
    const items = returnItems
      .filter((it) => Number(it.quantity) > 0)
      .map((it) => ({
        item_id: it.item_id,
        sn_id: it.sn_id || null,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price || 0),
      }));

    if (items.length === 0) {
      setError('Select at least one return item');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await salesService.createReturn(modal.sale.sale_id, {
        reason: reason || null,
        items,
      });
      setModal({ open: false, sale: null, loading: false });
      await load();
    } catch (e) {
      setError(e.message || 'Failed to create return');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Returns</h2>
          <p className="text-sm text-gray-500">Create returns against completed sales</p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
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
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
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
                <th className="text-right font-semibold px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No sales</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.sale_id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{s.sale_number}</td>
                    <td className="px-4 py-3 text-gray-700">{s.customer_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{String(s.sale_date).slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(s.grand_total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openReturn(s.sale_id)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Create Return
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Return Items</h3>
              <button
                onClick={() => setModal({ open: false, sale: null, loading: false })}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modal.loading || !modal.sale ? (
                <div className="text-center text-gray-500 py-10">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Sale #</span>
                      <div className="font-mono text-gray-800">{modal.sale.sale_number}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Customer</span>
                      <div className="text-gray-800">{modal.sale.customer_name || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Date</span>
                      <div className="text-gray-800">{String(modal.sale.sale_date).slice(0, 10)}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left font-semibold px-4 py-3">Product</th>
                          <th className="text-left font-semibold px-4 py-3">SN</th>
                          <th className="text-left font-semibold px-4 py-3">Sold Qty</th>
                          <th className="text-left font-semibold px-4 py-3">Return Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnItems.map((it, idx) => (
                          <tr key={`${it.item_id}-${it.sn_id}-${idx}`} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-gray-800">{it.name}</td>
                            <td className="px-4 py-3 text-gray-600">{it.sn_id || '-'}</td>
                            <td className="px-4 py-3 text-gray-600">{it.maxQty}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={it.maxQty}
                                step="1"
                                value={it.quantity}
                                onChange={(e) =>
                                  setReturnItems((prev) =>
                                    prev.map((row, i) =>
                                      i === idx ? { ...row, quantity: e.target.value } : row
                                    )
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModal({ open: false, sale: null, loading: false })}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={submitReturn}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Submit Return'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
