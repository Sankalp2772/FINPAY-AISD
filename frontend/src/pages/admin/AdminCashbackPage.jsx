import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Percent, Plus, Edit2, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

export const AdminCashbackPage = () => {
  const [rules, setRules] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    merchantId: '',
    percentage: '5',
    minSpend: '50',
    maxCashback: '100',
    status: 'ACTIVE'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, mRes] = await Promise.all([
        api.get('/cashback/rules'),
        api.get('/merchants')
      ]);
      if (rRes.data.success) setRules(rRes.data.data);
      if (mRes.data.success) setMerchants(mRes.data.data);
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
    setEditingRule(null);
    setFormData({
      title: '',
      merchantId: '',
      percentage: '5',
      minSpend: '50',
      maxCashback: '100',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      title: rule.title,
      merchantId: rule.merchantId ? String(rule.merchantId) : '',
      percentage: String(rule.percentage),
      minSpend: String(rule.minSpend),
      maxCashback: rule.maxCashback ? String(rule.maxCashback) : '',
      status: rule.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        merchantId: formData.merchantId ? Number(formData.merchantId) : null,
        percentage: Number(formData.percentage),
        minSpend: Number(formData.minSpend || 0),
        maxCashback: formData.maxCashback ? Number(formData.maxCashback) : null,
        status: formData.status
      };

      if (editingRule) {
        await api.put(`/cashback/rules/${editingRule.id}`, payload);
      } else {
        await api.post('/cashback/rules', payload);
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving rule');
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
          <h1 className="text-2xl font-bold text-slate-800">Cashback Program Rules</h1>
          <p className="text-sm text-slate-500">Configure percentage rates, spending thresholds, and merchant specific incentives</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Rule Title</th>
                <th className="py-3 px-6">Applicable Merchant</th>
                <th className="py-3 px-6">Cashback %</th>
                <th className="py-3 px-6">Min Spend</th>
                <th className="py-3 px-6">Max Cap</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {r.title}
                  </td>
                  <td className="py-4 px-6">
                    {r.merchant ? (
                      <span className="font-medium text-blue-700">{r.merchant.name}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-medium">
                        All Campus Merchants (Global)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-bold text-blue-600">
                    {Number(r.percentage)}%
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-700">
                    ₹{Number(r.minSpend).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-700">
                    {r.maxCashback ? `₹${Number(r.maxCashback).toFixed(2)}` : 'No Limit'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenEdit(r)}
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

      {/* Modal: Create/Edit Rule */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              {editingRule ? 'Edit Cashback Rule' : 'New Cashback Incentive Rule'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canteen 10% Happy Hours"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Merchant</label>
                <select
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Global (All Campus Stores)</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.merchantCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.maxCashback}
                    onChange={(e) => setFormData({ ...formData, maxCashback: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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
                  Save Cashback Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
