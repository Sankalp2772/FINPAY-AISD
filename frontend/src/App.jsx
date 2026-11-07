import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentWalletPage } from './pages/student/StudentWalletPage';
import { MakePaymentPage } from './pages/student/MakePaymentPage';
import { StudentPaymentHistoryPage } from './pages/student/StudentPaymentHistoryPage';
import { StudentCashbackPage } from './pages/student/StudentCashbackPage';
import { StudentMerchantsPage } from './pages/student/StudentMerchantsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminMerchantsPage } from './pages/admin/AdminMerchantsPage';
import { AdminCashbackPage } from './pages/admin/AdminCashbackPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminReconciliationPage } from './pages/admin/AdminReconciliationPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="wallet" element={<StudentWalletPage />} />
          <Route path="payment" element={<MakePaymentPage />} />
          <Route path="transactions" element={<StudentPaymentHistoryPage />} />
          <Route path="cashback" element={<StudentCashbackPage />} />
          <Route path="merchants" element={<StudentMerchantsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="merchants" element={<AdminMerchantsPage />} />
          <Route path="cashback" element={<AdminCashbackPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="reconciliation" element={<AdminReconciliationPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
