import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileCheck2, Download, RefreshCw, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

export const AdminReconciliationPage = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/reconciliation/report?year=${year}&month=${month}`);
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating reconciliation report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const handleDownloadCsv = () => {
    const token = localStorage.getItem('finpay_token');
    const url = `http://localhost:5000/api/reconciliation/export-csv?year=${year}&month=${month}`;
    
    // Trigger direct download with auth header via fetch
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `finpay_reconciliation_${year}_${month}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert('Failed to download CSV'));
  };

  const details = report?.details;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Monthly Reconciliation Module</h1>
          <p className="text-sm text-slate-500">Cross-verify payment volumes, cashback eligibility, and audit ledger balances</p>
        </div>

        {/* Month/Year selectors */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400 ml-1" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[
              { m: 1, name: 'January' },
              { m: 2, name: 'February' },
              { m: 3, name: 'March' },
              { m: 4, name: 'April' },
              { m: 5, name: 'May' },
              { m: 6, name: 'June' },
              { m: 7, name: 'July' },
              { m: 8, name: 'August' },
              { m: 9, name: 'September' },
              { m: 10, name: 'October' },
              { m: 11, name: 'November' },
              { m: 12, name: 'December' }
            ].map((item) => (
              <option key={item.m} value={item.m}>{item.name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={generateReport}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Audit
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={!report}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      {details && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Payments</span>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ₹{Number(details.totalPaymentAmount).toFixed(2)}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                {details.totalPaymentsCount} transactions recorded
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Eligible Volume</span>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                ₹{Number(details.eligiblePaymentAmount).toFixed(2)}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                {details.eligiblePaymentsCount} qualifying payments
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Cashback Credited</span>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                ₹{Number(details.totalCashbackCredited).toFixed(2)}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Expected: ₹{Number(details.expectedCashbackAmount).toFixed(2)}
              </span>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs ${
              Math.abs(details.differenceAmount) < 0.01
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-amber-50/50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-600">Difference / Variance</span>
                {Math.abs(details.differenceAmount) < 0.01 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className={`text-2xl font-bold mt-2 ${
                Math.abs(details.differenceAmount) < 0.01 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                ₹{Number(details.differenceAmount).toFixed(2)}
              </p>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">
                Status: {details.status}
              </span>
            </div>
          </div>

          {/* Detailed Transactions List for selected month */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Reconciled Payments for {month}/{year}</h3>
                <p className="text-xs text-slate-500">Breakdown of transactions checked during this reconciliation cycle</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Audited By: {report?.record?.reconciledBy || 'Admin'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">Payment Ref</th>
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Merchant</th>
                    <th className="py-3 px-6">Gross Amount</th>
                    <th className="py-3 px-6">Cashback Credited</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {details.payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No transactions registered for the selected period.
                      </td>
                    </tr>
                  ) : (
                    details.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-700">
                          {p.paymentRef}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800">
                            {p.wallet?.student?.user?.fullName || 'Student'}
                          </p>
                          <p className="text-xs text-slate-400">{p.wallet?.student?.studentIdCard}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800">{p.merchant?.name}</p>
                          <p className="text-xs text-slate-400">{p.merchant?.merchantCode}</p>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          ₹{Number(p.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          {Number(p.cashbackAmount) > 0 ? (
                            <span className="text-emerald-600 font-semibold text-xs">
                              +₹{Number(p.cashbackAmount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">₹0.00</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
