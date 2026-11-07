import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Shield, Clock } from 'lucide-react';

export const StudentWalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topupAmount, setTopupAmount] = useState('200');
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [wRes, txRes] = await Promise.all([
        api.get('/wallet/my-wallet'),
        api.get('/wallet/my-transactions?limit=20')
      ]);

      if (wRes.data.success) setWallet(wRes.data.data);
      if (txRes.data.success) setTransactions(txRes.data.data);
    } catch (err) {
      setMsg({ text: 'Failed to load wallet data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || Number(topupAmount) <= 0) return;

    setTopupLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await api.post('/wallet/topup', { amount: Number(topupAmount) });
      if (res.data.success) {
        setMsg({ text: `Successfully topped up ₹${topupAmount}!`, type: 'success' });
        fetchWalletData();
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Topup failed', type: 'error' });
    } finally {
      setTopupLoading(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Student Wallet</h1>
        <p className="text-sm text-slate-500">Manage your FinPay digital balance, funds, and limits</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-sm ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Wallet Card & Topup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Virtual FinPay Card */}
        <div className="md:col-span-2 bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-800 text-white rounded-3xl p-7 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none blur-2xl" />
          
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-300 font-mono">FINPAY ACADEMIC CARD</span>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Campus ID Linked</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs rounded-full font-semibold">
              {wallet?.status || 'ACTIVE'}
            </span>
          </div>

          <div>
            <p className="text-xs text-blue-200 font-medium">Available Balance</p>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">
              ₹{Number(wallet?.balance || 0).toFixed(2)}
            </h2>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Wallet Account</p>
              <p className="font-mono text-sm tracking-wider font-semibold text-slate-200">
                {wallet?.walletNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase">Holder</p>
              <p className="text-sm font-semibold text-slate-200">{wallet?.student?.user?.fullName}</p>
            </div>
          </div>
        </div>

        {/* Demo Topup Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-base">Quick Top-Up</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add demo funds instantly to simulate scholarship credits or student deposits.
            </p>

            <form onSubmit={handleTopup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="200"
                  />
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2">
                {['100', '200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    className={`flex-1 py-1 text-xs rounded-lg border transition ${
                      topupAmount === amt ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={topupLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition shadow-xs disabled:opacity-50"
              >
                {topupLoading ? 'Processing...' : 'Deposit Funds Now'}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted internal academic ledger</span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-base">Full Wallet Ledger Log</h3>
          </div>
          <span className="text-xs text-slate-400">{transactions.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Type & Description</th>
                <th className="py-3 px-6">Direction</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Balance After</th>
                <th className="py-3 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      {tx.transactionRef}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{tx.description}</p>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        tx.direction === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.direction}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold">
                      <span className={tx.direction === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'}>
                        {tx.direction === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      ₹{Number(tx.balanceAfter).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleString()}
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
