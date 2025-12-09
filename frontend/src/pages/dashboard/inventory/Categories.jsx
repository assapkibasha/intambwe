import React, { useEffect, useState } from 'react';
import inventoryService from '../../../services/inventoryService';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const resp = await inventoryService.listCategories();
      setCategories(resp.data || resp);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createCategory(form);
      setForm({ name: '', description: '' });
      await load();
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await inventoryService.deleteCategory(id);
      await load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Categories</h2>

      <div className="bg-white p-4 rounded shadow">
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="p-2 border" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-2 border" />
          <div className="sm:col-span-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Category</button>
          </div>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {loading ? <div>Loading...</div> : (
          <ul className="space-y-2">
            {categories.map(c => (
              <li key={c.category_id} className="flex justify-between items-center border-b py-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-slate-500">{c.description}</div>
                </div>
                <div>
                  <button onClick={() => handleDelete(c.category_id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
