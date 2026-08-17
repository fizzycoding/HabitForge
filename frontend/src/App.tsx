import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Layout } from './components/layout/Layout.js';
import { Dashboard } from './pages/Dashboard.js';
import { HabitsPage } from './pages/HabitsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { BadgesPage } from './pages/BadgesPage.js';
import { UpgradePage } from './pages/UpgradePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { VerifyEmailPage } from './pages/VerifyEmail.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-indigo-400 font-bold">
        Loading HabitForge...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="upgrade" element={<UpgradePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
