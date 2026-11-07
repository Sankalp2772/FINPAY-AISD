import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Receipt, Search, CheckCircle2, User, Store } from 'lucide-react';

export const AdminTransactionsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payments/all-history');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase();
    const student = p.wallet?.student?.user?.fullName?.toLowerCase() || '';
    const merchant = p.merchant?.name?.toLowerCase() || '';
    const ref = p.paymentRef.toLowerCase();
    return student.includes(term) || merchant.includes(term) || ref.includes(term);
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
          <h1 className="text-2xl font-bold text-slate-800">Master Payment Transactions</h1>
          <p className="text-sm text-slate-500">Centralized log of all student debits, merchant payments, and cashback credits</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ref, student, merchant..."
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
                <th className="py-3 px-6">Payment Ref</th>
                <th className="py-3 px-6">Student (Payer)</th>
                <th className="py-3 px-6">Merchant (Payee)</th>
                <th className="py-3 px-6">Amount (INR)</th>
                <th className="py-3 px-6">Cashback Credited</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700">
                      {p.paymentRef}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{p.wallet?.student?.user?.fullName}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {p.wallet?.student?.studentIdCard} • {p.wallet?.walletNumber}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{p.merchant?.name}</p>
                      <p className="text-xs text-slate-400">{p.merchant?.category?.name}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ₹{Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {Number(p.cashbackAmount) > 0 ? (
                        <span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          +₹{Number(p.cashbackAmount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">₹0.00</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleString()}
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
