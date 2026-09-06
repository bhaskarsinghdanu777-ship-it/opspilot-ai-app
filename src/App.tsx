import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from '@/src/lib/router';
import { AuthProvider, useAuth } from '@/src/lib/firebase/AuthContext';
import { AppLayout } from '@/src/components/layout/AppLayout';
import { LoginPage } from '@/src/pages/LoginPage';
import { SignupPage } from '@/src/pages/SignupPage';
import { DashboardPage } from '@/src/pages/DashboardPage';
import { SalesPage } from '@/src/pages/SalesPage';
import { InventoryPage } from '@/src/pages/InventoryPage';
import { CustomersPage } from '@/src/pages/CustomersPage';
import { ExpensesPage } from '@/src/pages/ExpensesPage';
import { AiOperationsPage } from '@/src/pages/AiOperationsPage';
import { HistoryPage } from '@/src/pages/HistoryPage';
import { BrainCircuit } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const { user, loading } = useAuth();

  // Route protection & automatic redirection
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = currentRoute === '/login' || currentRoute === '/signup';

    if (!user && !isAuthRoute) {
      // Unauthenticated users trying to access protected pages are routed to /login
      navigate('/login');
    } else if (user && isAuthRoute) {
      // Authenticated users on login/signup are routed to /dashboard
      navigate('/dashboard');
    }
  }, [user, loading, currentRoute, navigate]);

  // Loading splash screen while Firebase restores authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 text-blue-400 mb-4 animate-pulse border border-blue-500/30">
          <BrainCircuit className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white">OpsPilot AI</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">
          Verifying secure session & tenant authorization...
        </p>
      </div>
    );
  }

  // Unauthenticated user guard
  if (!user) {
    if (currentRoute === '/signup') {
      return <SignupPage />;
    }
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/login':
      case '/signup':
      case '/dashboard':
        return <DashboardPage />;
      case '/sales':
        return <SalesPage />;
      case '/inventory':
        return <InventoryPage />;
      case '/customers':
        return <CustomersPage />;
      case '/expenses':
        return <ExpensesPage />;
      case '/ai':
        return <AiOperationsPage />;
      case '/history':
        return <HistoryPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderCurrentPage()}</AppLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}

