import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex font-sans antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
