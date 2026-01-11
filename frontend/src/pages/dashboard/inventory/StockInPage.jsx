import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, RefreshCw, X, PackagePlus } from 'lucide-react';
import stockInService from '../../../services/stockInService';
import productService from '../../../services/productService';
import { useEmployeeAuth } from '../../../contexts/EmployeeAuthContext';

export default function StockInPage() {
  const { employee } = useEmployeeAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reference_number: '',
    supplier_name: '',
    supplier_contact: '',
    received_date: new Date().toISOString().slice(0, 10),
    notes: '',
    status: 'pending',
  });

  const [itemsModal, setItemsModal] = useState({ open: false, stockIn: null });
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [addItem, setAddItem] = useState({ item_id: '', quantity: 1, sn_id: '', unit_price: 0 });
  const [addingItem, setAddingItem] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await stockInService.getAllStockIn({ search: search.trim() });
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load stock in records');
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
    return rows.filter((r) => `${r.reference_number} ${r.supplier_name}`.toLowerCase().includes(q));
  }, [rows, search]);

  const openCreate = () => {
    setForm({
      reference_number: '',
      supplier_name: '',
      supplier_contact: '',
      received_date: new Date().toISOString().slice(0, 10),
      notes: '',
      status: 'pending',
    });
    setShowModal(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!employee?.emp_id) {
      setError('Missing employee session');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await stockInService.createStockIn({
        reference_number: form.reference_number.trim(),
        supplier_name: form.supplier_name.trim(),
        supplier_contact: form.supplier_contact.trim() || null,
        received_by: employee.emp_id,
        received_date: form.received_date,
        notes: form.notes || null,
        status: form.status,
      });
      setShowModal(false);
      await load();
    } catch (e2) {
      setError(e2.message || 'Failed to create stock in');
    } finally {
      setSaving(false);
    }
  };

  const openItems = async (stockIn) => {
    setItemsModal({ open: true, stockIn });
    setItems([]);
    setProducts([]);
    setAddItem({ item_id: '', quantity: 1, sn_id: '', unit_price: 0 });

    try {
      setItemsLoading(true);
      const [itemsRes, prodRes] = await Promise.all([
        stockInService.listItems(stockIn.stock_inId),
        productService.getAllProducts(),
      ]);
      setItems(itemsRes.data || []);
      setProducts(prodRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load stock items');
    } finally {
      setItemsLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.item_id === addItem.item_id);

  const addOneItem = async () => {
    if (!itemsModal.stockIn) return;
    if (!addItem.item_id) {
      setError('Select a product');
      return;
    }
    const qty = Number(addItem.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Invalid quantity');
      return;
    }
    if (selectedProduct?.track_serial) {
      if (!addItem.sn_id.trim()) {
        setError('sn_id is required for serial-tracked product');
        return;
      }
      if (qty !== 1) {
        setError('Quantity must be 1 for serial-tracked product');
        return;
      }
    }

    try {
      setAddingItem(true);
      setError('');
      await stockInService.addItems(itemsModal.stockIn.stock_inId, [
        {
          item_id: addItem.item_id,
          quantity: qty,
          sn_id: addItem.sn_id.trim() || null,
          unit_price: Number(addItem.unit_price || 0),
        },
      ]);
      const itemsRes = await stockInService.listItems(itemsModal.stockIn.stock_inId);
      setItems(itemsRes.data || []);
      setAddItem({ item_id: '', quantity: 1, sn_id: '', unit_price: 0 });
    } catch (e) {
      setError(e.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock In</h2>
          <p className="text-sm text-gray-500">Receive stock from suppliers</p>
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
            New Stock In
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
              placeholder="Search stock in..."
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
                <th className="text-left font-semibold px-4 py-3">Supplier</th>
                <th className="text-left font-semibold px-4 py-3">Received Date</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
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
                  <tr key={r.stock_inId} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{r.reference_number}</td>
                    <td className="px-4 py-3 text-gray-700">{r.supplier_name}</td>
                    <td className="px-4 py-3 text-gray-600">{String(r.received_date).slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openItems(r)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                        >
                          <PackagePlus className="w-4 h-4" />
                          Items
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
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">New Stock In</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                  <input
                    value={form.reference_number}
                    onChange={(e) => setForm((p) => ({ ...p, reference_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Required"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                  <input
                    type="date"
                    value={form.received_date}
                    onChange={(e) => setForm((p) => ({ ...p, received_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    value={form.supplier_name}
                    onChange={(e) => setForm((p) => ({ ...p, supplier_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Required"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label>
                  <input
                    value={form.supplier_contact}
                    onChange={(e) => setForm((p) => ({ ...p, supplier_contact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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

      {itemsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Stock Items</h3>
                <p className="text-sm text-gray-500">{itemsModal.stockIn?.reference_number}</p>
              </div>
              <button onClick={() => setItemsModal({ open: false, stockIn: null })} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={addItem.item_id}
                    onChange={(e) => {
                      const item_id = e.target.value;
                      const p = products.find((x) => x.item_id === item_id);
                      setAddItem((prev) => ({
                        ...prev,
                        item_id,
                        quantity: p?.track_serial ? 1 : prev.quantity,
                        unit_price: Number(p?.default_unit_price || 0),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {products.map((p) => (
                      <option key={p.item_id} value={p.item_id}>
                        {p.name} ({p.item_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={addItem.quantity}
                    onChange={(e) => setAddItem((p) => ({ ...p, quantity: e.target.value }))}
                    disabled={Boolean(selectedProduct?.track_serial)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SN (if needed)</label>
                  <input
                    value={addItem.sn_id}
                    onChange={(e) => setAddItem((p) => ({ ...p, sn_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={selectedProduct?.track_serial ? 'Required' : 'Optional'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addItem.unit_price}
                    onChange={(e) => setAddItem((p) => ({ ...p, unit_price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-5 flex justify-end">
                  <button
                    onClick={addOneItem}
                    disabled={addingItem}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                    {addingItem ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
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
                    {itemsLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No items yet</td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.stock_id} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-gray-800">{it.product?.name || it.item_id}</td>
                          <td className="px-4 py-3 text-gray-600">{it.sn_id || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{Number(it.quantity || 0)}</td>
                          <td className="px-4 py-3 text-gray-600">{Number(it.unit_price || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
