import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Key, UserCheck, Server } from 'lucide-react';

export const AdminProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Administrator Profile</h1>
        <p className="text-sm text-slate-500">System credentials, security role, and architecture environment</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            A
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user?.fullName}</h2>
            <p className="text-xs text-blue-600 font-medium">FinPay Core Administrator</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
              {user?.role} Access Level
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Admin Email</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Authentication Method</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Bcrypt Hash + JWT Token</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Architecture</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Modular Monolith (4-Layer)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Database State</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>MySQL 8.0 / Prisma ORM</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong>Security Note:</strong> All API routes are protected by role-based middleware (`ADMIN`, `STUDENT`). Monetary calculations are strictly handled server-side inside ACID transactions to ensure 100% balance consistency.
          </div>
        </div>
      </div>
    </div>
  );
};
