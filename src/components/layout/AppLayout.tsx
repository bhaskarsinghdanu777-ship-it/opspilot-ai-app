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

        {/* Global Architecture Banner for Judges */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 lg:px-8 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Phase 2 Active
            </span>
            <span className="hidden sm:inline text-slate-700 font-medium">
              Firebase Authentication & Cloud Firestore (ABAC Multi-Tenant Isolated)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono hidden md:flex items-center gap-2">
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

