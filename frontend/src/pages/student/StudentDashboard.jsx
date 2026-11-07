import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  ShoppingBag, 
  Send,
  PlusCircle,
  RefreshCw
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reconciliation/student-dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError('Unable to load student metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
            Student Overview
          </span>
          <h1 className="text-2xl font-bold mt-1">Hello, {user?.fullName}!</h1>
          <p className="text-blue-100 text-sm mt-0.5">
            Wallet No: <span className="font-mono font-medium">{stats?.walletNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/student/payment"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
            Make Payment
          </Link>
          <Link
            to="/student/wallet"
            className="inline-flex items-center gap-2 bg-blue-500/40 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-500/60 transition border border-white/20"
          >
            <PlusCircle className="w-4 h-4" />
            Add Funds
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Available Balance</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{Number(stats?.balance || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            ● Ready for campus merchants
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Payments</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{Number(stats?.totalSpent || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats?.paymentsCount || 0} transactions completed
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Cashback Earned</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            +₹{Number(stats?.totalCashbackEarned || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Auto-credited to wallet
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Student Status</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {user?.student?.studentIdCard || 'Enrolled'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {user?.student?.department || 'Department Verified'}
          </span>
        </div>
      </div>

      {/* Recent Ledger Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Recent Wallet Transactions</h2>
            <p className="text-xs text-slate-500">Real-time ledger updates from MySQL</p>
          </div>
          <Link
            to="/student/transactions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Ledger →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {(!stats?.recentTransactions || stats.recentTransactions.length === 0) ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No transactions recorded yet. Make a payment to see activity!
            </div>
          ) : (
            stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    tx.direction === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {tx.direction === 'CREDIT' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tx.description}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      Ref: {tx.transactionRef} • {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    tx.direction === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {tx.direction === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Bal: ₹{Number(tx.balanceAfter).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
