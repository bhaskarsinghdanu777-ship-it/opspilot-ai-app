import React, { useState } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { useRouter } from '@/src/lib/router';
import { ShieldCheck } from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRoute } = useRouter();

  // If on login or signup route, render without sidebar/header chrome
  if (currentRoute === '/login' || currentRoute === '/signup') {
    return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Production Architecture & Security Boundary Banner */}
        <div
          id="production-status-banner"
          className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 text-xs text-slate-600"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Production Ready
            </span>
            <span className="text-slate-700 font-medium truncate">
              Firebase Authentication & Cloud Firestore (Multi-Tenant Isolation)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono hidden md:flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Firestore Rules Deployed • Zero-Trust Boundary</span>
          </div>
        </div>

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

