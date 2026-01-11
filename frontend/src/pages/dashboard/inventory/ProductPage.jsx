import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw, X } from 'lucide-react';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';

export default function ProductPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    item_id: '',
    name: '',
    sku: '',
    category_id: '',
    track_serial: false,
    default_unit_price: 0,
    active: true,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [pRes, cRes] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
      ]);
      setAllProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter((p) => `${p.item_id} ${p.name} ${p.sku || ''}`.toLowerCase().includes(q));
  }, [allProducts, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      item_id: '',
      name: '',
      sku: '',
      category_id: '',
      track_serial: false,
      default_unit_price: 0,
      active: true,
    });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      item_id: row.item_id || '',
      name: row.name || '',
      sku: row.sku || '',
      category_id: row.category_id ? String(row.category_id) : '',
      track_serial: Boolean(row.track_serial),
      default_unit_price: Number(row.default_unit_price || 0),
      active: row.active === undefined ? true : Boolean(row.active),
    });
    setShowModal(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.item_id.trim()) {
      setError('item_id is required');
      return;
    }
    if (!form.name.trim()) {
      setError('name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = {
        item_id: form.item_id.trim(),
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        track_serial: Boolean(form.track_serial),
        default_unit_price: Number(form.default_unit_price || 0),
        active: Boolean(form.active),
      };

      if (editing) {
        await productService.updateProduct(editing.item_id, payload);
      } else {
        await productService.createProduct(payload);
      }

      setShowModal(false);
      await load();
    } catch (e2) {
      setError(e2.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    const ok = window.confirm(`Delete product "${row.name}" (${row.item_id})?`);
    if (!ok) return;
    try {
      setError('');
      await productService.deleteProduct(row.item_id);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500">Manage products & pricing</p>
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
            New Product
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
              placeholder="Search product..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Item ID</th>
                <th className="text-left font-semibold px-4 py-3">Name</th>
                <th className="text-left font-semibold px-4 py-3">SKU</th>
                <th className="text-left font-semibold px-4 py-3">Category</th>
                <th className="text-left font-semibold px-4 py-3">Serial</th>
                <th className="text-left font-semibold px-4 py-3">Price</th>
                <th className="text-left font-semibold px-4 py-3">Active</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No products found</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.item_id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{row.item_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.sku || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.track_serial ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(row.default_unit_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.active ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(row)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
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
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editing ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                  <input
                    value={form.item_id}
                    onChange={(e) => setForm((p) => ({ ...p, item_id: e.target.value }))}
                    disabled={Boolean(editing)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="e.g. PEN-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Ballpoint Pen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Unit Price</label>
                  <input
                    type="number"
                    value={form.default_unit_price}
                    onChange={(e) => setForm((p) => ({ ...p, default_unit_price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.track_serial}
                      onChange={(e) => setForm((p) => ({ ...p, track_serial: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    Track serial
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    Active
                  </label>
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
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
