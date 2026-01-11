import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import inventoryService from '../../../services/inventoryService';
import categoryService from '../../../services/categoryService';

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const load = async (params = {}) => {
    try {
      setLoading(true);
      setError('');
      const [invRes, catRes] = await Promise.all([
        inventoryService.getSummary(params),
        categoryService.getAllCategories(),
      ]);
      setRows(invRes.data || []);
      setCategories(catRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load inventory summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.item_id} ${r.name} ${r.sku || ''}`.toLowerCase().includes(q));
  }, [rows, search]);

  const onApply = async () => {
    await load({ search: search.trim(), category_id: categoryId || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
          <p className="text-sm text-gray-500">Stock on hand per product</p>
        </div>

        <button
          onClick={() => load({ search: search.trim(), category_id: categoryId || undefined })}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={onApply}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
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
                <th className="text-left font-semibold px-4 py-3">On Hand</th>
                <th className="text-left font-semibold px-4 py-3">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No rows</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.item_id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-gray-800">{r.item_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.sku || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(r.on_hand_quantity || 0)}</td>
                    <td className="px-4 py-3 text-gray-600">{Number(r.default_unit_price || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
