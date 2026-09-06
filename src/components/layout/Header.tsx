import React, { useState } from 'react';
import { useRouter } from '@/src/lib/router';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Search,
  Menu,
} from 'lucide-react';
import { inventoryAlerts } from '@/src/lib/mock-data/overview';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { currentRoute, navigate } = useRouter();
  const { user, userProfile, business, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = (route: string) => {
    switch (route) {
      case '/dashboard':
        return 'Dashboard';
      case '/sales':
        return 'Sales & POS';
      case '/inventory':
        return 'Inventory Management';
      case '/customers':
        return 'Customers';
      case '/expenses':
        return 'Expenses';
      case '/ai':
        return 'AI Operations Studio';
      case '/history':
        return 'Analysis History';
      default:
        return 'Overview';
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Dev Anand';
  const displayEmail = user?.email || 'manager@novamart.in';
  const displayBusiness = business?.name || 'NovaMart Electronics';
  const initials = displayName
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OP';

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8"
    >
      {/* Left: Mobile Toggle & Page Breadcrumb Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center">
            <span>{displayBusiness}</span>
            <span className="text-slate-400 text-xs sm:text-sm font-normal ml-2">
              / {getPageTitle(currentRoute)}
            </span>
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Search Bar */}
        <div className="relative h-10 w-36 sm:w-64 hidden sm:block">
          <input
            type="text"
            placeholder="Search records..."
            className="w-full h-full bg-slate-100 rounded-full pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border-none text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3 pointer-events-none" />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="notifications-bell-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <div
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                  Operational Alerts
                </span>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  {inventoryAlerts.length} Attention Required
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-md mt-0.5 ${
                          alert.urgency === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{alert.product}</p>
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            {alert.stock} in stock
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{alert.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/inventory');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Open Inventory Panel &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="relative">
          <button
            id="user-profile-menu-button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
              {initials}
            </div>
            <div className="hidden sm:block text-xs">
              <div className="font-semibold text-slate-900">{displayName}</div>
              <div className="text-[11px] text-slate-500">{displayBusiness}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-600 font-medium truncate">
                    Workspace: {displayBusiness}
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Business Workspace</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/ai');
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>AI Operations Studio</span>
                </button>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Firebase Firestore DB</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              <div className="pt-1 border-t border-slate-100 text-xs">
                <button
                  id="btn-logout"
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out (Firebase Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
