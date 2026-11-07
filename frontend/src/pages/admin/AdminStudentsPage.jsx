import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Wallet, ShieldCheck, UserX, UserCheck } from 'lucide-react';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStatus = async (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/students/${studentId}/status`, { status: nextStatus });
      fetchStudents();
    } catch (err) {
      alert('Failed to update student status');
    }
  };

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.user?.fullName?.toLowerCase().includes(term) ||
      s.user?.email?.toLowerCase().includes(term) ||
      s.studentIdCard?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term)
    );
  });

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
          <h1 className="text-2xl font-bold text-slate-800">Student Accounts & Wallets</h1>
          <p className="text-sm text-slate-500">Manage enrolled students, academic cards, and active balances</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Student ID</th>
                <th className="py-3 px-6">Name & Email</th>
                <th className="py-3 px-6">Department & Semester</th>
                <th className="py-3 px-6">Wallet Number</th>
                <th className="py-3 px-6">Balance (INR)</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No matching students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700">
                      {s.studentIdCard}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{s.user?.fullName}</p>
                      <p className="text-xs text-slate-400">{s.user?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-medium text-slate-700">{s.department}</p>
                      <p className="text-[11px] text-slate-400">{s.semester}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {s.wallet?.walletNumber || 'Unassigned'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ₹{Number(s.wallet?.balance || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleStatus(s.id, s.status)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                          s.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
