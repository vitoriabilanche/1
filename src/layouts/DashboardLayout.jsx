
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
