import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Send, Store, Wallet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const MakePaymentPage = () => {
  const location = useLocation();
  const [merchants, setMerchants] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, wRes] = await Promise.all([
        api.get('/merchants'),
        api.get('/wallet/my-wallet')
      ]);

      if (mRes.data.success) {
        setMerchants(mRes.data.data);
        // If merchant passed via state from merchants page
        if (location.state?.merchantId) {
          setSelectedMerchantId(String(location.state.merchantId));
        } else if (mRes.data.data.length > 0) {
          setSelectedMerchantId(String(mRes.data.data[0].id));
        }
      }

      if (wRes.data.success) {
        setWallet(wRes.data.data);
      }
    } catch (err) {
      setError('Unable to fetch merchant or wallet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedMerchant = merchants.find((m) => String(m.id) === String(selectedMerchantId));
  const activeRule = selectedMerchant?.cashbackRules?.[0];

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (Number(wallet?.balance || 0) < numAmount) {
      setError(`Insufficient wallet balance (₹${wallet?.balance || '0.00'}). Please top up your wallet.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/payments/pay', {
        merchantId: selectedMerchantId,
        amount: numAmount
      });

      if (res.data.success) {
        setResult(res.data.data);
        setAmount('');
        // Refresh wallet balance
        const wRes = await api.get('/wallet/my-wallet');
        if (wRes.data.success) setWallet(wRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Make a Payment</h1>
        <p className="text-sm text-slate-500">Pay registered campus merchants directly from your student wallet</p>
      </div>

      {/* Available Balance Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase">Current Wallet Balance</span>
            <p className="text-xl font-bold text-slate-800">₹{Number(wallet?.balance || 0).toFixed(2)}</p>
          </div>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-mono">
          {wallet?.walletNumber}
        </span>
      </div>

      {/* Payment Success Result Card */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-lg">Payment Successful!</h3>
          </div>
          <p className="text-sm text-emerald-800">
            Paid <span className="font-bold">₹{Number(result.payment.amount).toFixed(2)}</span> to <span className="font-bold">{result.merchant?.name}</span>.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-emerald-200">
            <div>
              <p className="text-emerald-700">Payment Reference:</p>
              <p className="font-mono font-semibold">{result.payment.paymentRef}</p>
            </div>
            <div>
              <p className="text-emerald-700">Updated Wallet Balance:</p>
              <p className="font-mono font-bold text-emerald-800">₹{Number(result.newBalance).toFixed(2)}</p>
            </div>
          </div>

          {result.cashback && (
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-300 flex items-center gap-2 text-xs text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Earned <strong className="text-emerald-700">₹{Number(result.cashback.amount).toFixed(2)}</strong> cashback ({result.cashback.percentageApplied}% rule) credited to your balance!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handlePay} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Campus Merchant
            </label>
            <div className="relative">
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.category?.name || 'General'}) - {m.merchantCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedMerchant && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <p className="font-semibold">{selectedMerchant.name}</p>
                <p className="text-slate-500 text-[11px]">{selectedMerchant.location}</p>
              </div>
              {activeRule ? (
                <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {activeRule.percentage}% Cashback Eligible
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Standard Campus Rule (5%) applies</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-base font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-base font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Amount Suggestion */}
          <div className="flex gap-2">
            {['50', '100', '150', '250', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="flex-1 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
              >
                ₹{val}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Authorize & Pay from Wallet</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
