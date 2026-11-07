import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Store, Plus, Edit2, CheckCircle2, XCircle, Search, Layers } from 'lucide-react';

export const AdminMerchantsPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    contactEmail: '',
    phone: '',
    location: '',
    isActive: true
  });

  const [catFormData, setCatFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        api.get('/merchants'),
        api.get('/merchants/categories')
      ]);
      if (mRes.data.success) setMerchants(mRes.data.data);
      if (cRes.data.success) {
        setCategories(cRes.data.data);
        if (cRes.data.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: String(cRes.data.data[0].id) }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingMerchant(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      contactEmail: '',
      phone: '',
      location: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMerchant(m);
    setFormData({
      name: m.name,
      categoryId: String(m.categoryId),
      contactEmail: m.contactEmail,
      phone: m.phone,
      location: m.location,
      isActive: m.isActive
    });
    setShowModal(true);
  };

  const handleSaveMerchant = async (e) => {
    e.preventDefault();
    try {
      if (editingMerchant) {
        await api.put(`/merchants/${editingMerchant.id}`, formData);
      } else {
        await api.post('/merchants', formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving merchant');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/merchants/categories', catFormData);
      setShowCatModal(false);
      setCatFormData({ name: '', code: '', description: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Merchant Directory & Categories</h1>
          <p className="text-sm text-slate-500">Configure on-campus merchant outlets, contacts, and classifications</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCatModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
          >
            <Layers className="w-4 h-4" />
            + Category
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Merchant
          </button>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Code</th>
                <th className="py-3 px-6">Merchant Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Contact Email / Phone</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700">
                    {m.merchantCode}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {m.name}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                      {m.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    {m.location}
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <p className="text-slate-700">{m.contactEmail}</p>
                    <p className="text-slate-400">{m.phone}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {m.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Merchant */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              {editingMerchant ? 'Edit Merchant Details' : 'Add New Campus Merchant'}
            </h3>
            <form onSubmit={handleSaveMerchant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Coffee Bar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="merchant@campus.edu"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block A, Food Court 1"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-xs text-slate-700 font-medium">
                  Active (Accepting Student Payments)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                >
                  {editingMerchant ? 'Update Merchant' : 'Create Merchant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Add Merchant Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT_SPORTS"
                  value={catFormData.code}
                  onChange={(e) => setCatFormData({ ...catFormData, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports & Fitness Complex"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
