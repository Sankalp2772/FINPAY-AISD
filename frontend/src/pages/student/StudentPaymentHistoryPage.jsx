import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Receipt, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export const StudentPaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payments/my-history');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment History</h1>
          <p className="text-sm text-slate-500">Record of all merchant payments made from your wallet</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
          Total: {payments.length} Payments
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Payment Reference</th>
                <th className="py-3 px-6">Merchant Details</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Amount Paid</th>
                <th className="py-3 px-6">Cashback Credited</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No payment history recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-700">
                      {p.paymentRef}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{p.merchant?.name}</p>
                      <p className="text-xs text-slate-400">{p.merchant?.merchantCode}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                        {p.merchant?.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ₹{Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {Number(p.cashbackAmount) > 0 ? (
                        <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
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
