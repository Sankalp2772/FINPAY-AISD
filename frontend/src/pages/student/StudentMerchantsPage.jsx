import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Store, MapPin, Phone, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const StudentMerchantsPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, cRes] = await Promise.all([
          api.get('/merchants'),
          api.get('/merchants/categories')
        ]);
        if (mRes.data.success) setMerchants(mRes.data.data);
        if (cRes.data.success) setCategories(cRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMerchants = selectedCat === 'ALL'
    ? merchants
    : merchants.filter((m) => String(m.categoryId) === String(selectedCat));

  const handlePayAtMerchant = (merchantId) => {
    navigate('/student/payment', { state: { merchantId } });
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
          <h1 className="text-2xl font-bold text-slate-800">Campus Merchants Directory</h1>
          <p className="text-sm text-slate-500">Find approved merchants and venues accepting FinPay wallet payments</p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCat === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Outlets
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(String(c.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCat === String(c.id)
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of merchants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMerchants.map((m) => {
          const rule = m.cashbackRules?.[0];
          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {m.merchantCode}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base">{m.name}</h3>
                <p className="text-xs text-blue-600 font-medium mb-3">
                  {m.category?.name || 'Campus Outlet'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{m.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{m.phone}</span>
                  </div>
                </div>

                {rule && (
                  <div className="mb-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>{Number(rule.percentage)}% Cashback</strong> on orders over ₹{Number(rule.minSpend).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handlePayAtMerchant(m.id)}
                className="w-full mt-2 py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 group"
              >
                <span>Pay this Merchant</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
