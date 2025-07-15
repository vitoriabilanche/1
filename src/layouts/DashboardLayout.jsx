
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-inherit p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
