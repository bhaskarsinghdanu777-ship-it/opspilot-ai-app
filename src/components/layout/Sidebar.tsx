import React from 'react';
import { useRouter } from '@/src/lib/router';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { RoutePath } from '@/src/types';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  Receipt,
  Sparkles,
  History,
  Info,
  Server,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: RoutePath;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRoute, navigate } = useRouter();
  const { user, userProfile, business, logout } = useAuth();

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Dev Anand';
  const displayBusiness = business?.name || 'NovaMart Electronics';
  const initials = displayName
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OP';


  const navigationItems: NavItem[] = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Sales',
      path: '/sales',
      icon: <TrendingUp className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: <Package className="w-4 h-4 shrink-0" />,
      badge: '3 out',
      badgeColor: 'bg-rose-100 text-rose-700 font-semibold',
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Expenses',
      path: '/expenses',
      icon: <Receipt className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'AI Operations',
      path: '/ai',
      icon: <Sparkles className="w-4 h-4 shrink-0 text-blue-500" />,
      badge: 'Preview',
      badgeColor: 'bg-blue-100 text-blue-700 font-medium',
    },
    {
      name: 'Analysis History',
      path: '/history',
      icon: <History className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleNavigate = (path: RoutePath) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Block */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-lg tracking-tight block">OpsPilot AI</span>
                <span className="text-[10px] text-slate-400 font-medium">Business Operations</span>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6 px-4 space-y-1">
            {navigationItems.slice(0, 5).map((item) => {
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.path}
                  id={`nav-link-${item.path.replace('/', '')}`}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300'
                          : item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Intelligence Section Header */}
            <div className="pt-4 pb-2 px-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Intelligence
              </span>
            </div>

            {navigationItems.slice(5).map((item) => {
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.path}
                  id={`nav-link-${item.path.replace('/', '')}`}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300'
                          : item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Phase 2 Status Area */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{displayBusiness}</p>
            </div>
            <button
              id="sidebar-btn-logout"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};
