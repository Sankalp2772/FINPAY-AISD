import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Gift, Sparkles, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export const StudentCashbackPage = () => {
  const [cashbacks, setCashbacks] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, rRes] = await Promise.all([
          api.get('/cashback/my-cashback'),
          api.get('/cashback/rules')
        ]);

        if (cRes.data.success) setCashbacks(cRes.data.data);
        if (rRes.data.success) setRules(rRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEarned = cashbacks.reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cashback Rewards</h1>
        <p className="text-sm text-slate-500">Track automatic cashback rewards credited straight to your student wallet</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">Total Cashback Earned</span>
            <div className="p-2 bg-white/20 rounded-xl">
              <Gift className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold mt-1">₹{totalEarned.toFixed(2)}</h2>
          <p className="text-xs text-emerald-100 mt-2">Saved across {cashbacks.length} transactions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase text-slate-400 font-semibold">Automated Credit Rule</span>
            <h3 className="font-bold text-slate-800 text-lg mt-1">Direct to Wallet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Every eligible merchant payment immediately triggers backend calculation and wallet balance credit.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-3">
            <ShieldCheck className="w-4 h-4" />
            Zero manual redemption needed
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase text-slate-400 font-semibold">Campus Cashback Offers</span>
            <h3 className="font-bold text-slate-800 text-lg mt-1">{rules.length} Active Rules</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check out offers at canteens, bookstores, and campus utility hubs.
            </p>
          </div>
          <span className="text-xs text-blue-600 font-medium mt-3">
            Up to 10% instant rebate
          </span>
        </div>
      </div>

      {/* Active Rules Carousel / Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Current Campus Cashback Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                  {Number(rule.percentage)}% Cashback
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {rule.merchant ? rule.merchant.name : 'All Campus Stores'}
                </span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{rule.title}</p>
              <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/50">
                <p>Min Spend: ₹{Number(rule.minSpend).toFixed(2)}</p>
                {rule.maxCashback && <p>Max Cap: ₹{Number(rule.maxCashback).toFixed(2)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Cashback History Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Payment Reference</th>
                <th className="py-3 px-6">Merchant</th>
                <th className="py-3 px-6">Payment Amount</th>
                <th className="py-3 px-6">Percentage Applied</th>
                <th className="py-3 px-6">Cashback Credited</th>
                <th className="py-3 px-6">Credited At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashbacks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No cashback credited yet. Pay at participating stores to receive cash rewards!
                  </td>
                </tr>
              ) : (
                cashbacks.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {c.paymentTransaction?.paymentRef}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {c.paymentTransaction?.merchant?.name || 'Campus Merchant'}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      ₹{Number(c.paymentTransaction?.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-medium text-blue-600">
                      {Number(c.percentageApplied)}%
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      +₹{Number(c.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(c.creditedAt).toLocaleString()}
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
