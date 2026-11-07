import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  Store, 
  TrendingUp, 
  Gift, 
  Receipt, 
  ArrowUpRight, 
  CheckCircle2, 
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reconciliation/admin-dashboard');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
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
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
            System Administration
          </span>
          <h1 className="text-2xl font-bold mt-1">FinPay Executive Console</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time aggregate telemetry across students, campus merchants, and payment volumes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reconciliation"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            Monthly Reconciliation
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Registered Students</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.totalStudents || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active wallet accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Partner Merchants</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.totalMerchants || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">On-campus outlets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Volume</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{Number(stats?.totalPaymentVolume || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Across {stats?.totalPaymentsCount || 0} transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Cashback Settled</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            ₹{Number(stats?.totalCashbackCredited || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Internal wallet credits</span>
        </div>
      </div>

      {/* Real-time System Payments Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Latest Network Transactions</h2>
            <p className="text-xs text-slate-500">Live feed of payments processed through the FinPay system</p>
          </div>
          <Link
            to="/admin/transactions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            All Transactions →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {(!stats?.recentPayments || stats.recentPayments.length === 0) ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No transactions recorded in the system yet.
            </div>
          ) : (
            stats.recentPayments.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {p.wallet?.student?.user?.fullName || 'Student'} → {p.merchant?.name}
                      </p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Ref: {p.paymentRef} • {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    ₹{Number(p.amount).toFixed(2)}
                  </span>
                  {Number(p.cashbackAmount) > 0 && (
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      Cashback: +₹{Number(p.cashbackAmount).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
