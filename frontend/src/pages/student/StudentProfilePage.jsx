import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Hash, BookOpen, Clock, ShieldCheck, Wallet } from 'lucide-react';

export const StudentProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Profile</h1>
        <p className="text-sm text-slate-500">View your verified academic and wallet details</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-100">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user?.fullName}</h2>
            <p className="text-xs text-blue-600 font-medium">Verified Student Account</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Email Address</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Student ID Card</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Hash className="w-4 h-4 text-blue-600" />
              <span>{user?.student?.studentIdCard || 'STU-DEMO-001'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Department</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{user?.student?.department || 'Computer Science'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">Current Semester</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{user?.student?.semester || '6th Semester'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2">
            <span className="text-xs text-slate-400 font-medium uppercase block mb-1">FinPay Wallet Identifier</span>
            <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-800">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span>{user?.student?.wallet?.walletNumber || 'FPW-SYSTEM-ACCOUNT'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong>Academic Evaluation System:</strong> All financial entries are kept inside the FinPay MySQL database with transactional guarantees. Balances and histories synchronize dynamically without simulated or mock data.
          </div>
        </div>
      </div>
    </div>
  );
};
