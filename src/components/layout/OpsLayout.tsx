import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { EscalationModal } from '../escalation/EscalationModal';
import { useApp } from '../../context/AppContext';

export const OpsLayout: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-[#0B7FF5] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-72px)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
          <Outlet />
        </main>
      </div>
      <EscalationModal />
    </div>
  );
};
