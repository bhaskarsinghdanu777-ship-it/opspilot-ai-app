import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoutePath } from '@/src/types';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { Sparkles } from 'lucide-react';

interface RouterContextType {
  currentRoute: RoutePath;
  navigate: (path: RoutePath, state?: Record<string, unknown>) => void;
  routeState: Record<string, unknown> | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const RouterContext = createContext<RouterContextType>({
  currentRoute: '/dashboard',
  navigate: () => {},
  routeState: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const VALID_ROUTES: RoutePath[] = [
  '/login',
  '/signup',
  '/dashboard',
  '/sales',
  '/inventory',
  '/customers',
  '/expenses',
  '/ai',
  '/history',
];

function normalizePath(path: string): RoutePath {
  if (VALID_ROUTES.includes(path as RoutePath)) {
    return path as RoutePath;
  }
  return '/dashboard';
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout: authLogout } = useAuth();

  const [currentRoute, setCurrentRoute] = useState<RoutePath>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname === '/' || !VALID_ROUTES.includes(pathname as RoutePath)) {
        return '/dashboard';
      }
      return pathname as RoutePath;
    }
    return '/dashboard';
  });

  const [routeState, setRouteState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname);
      setCurrentRoute(path);
      if (window.history.state) {
        setRouteState(window.history.state);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: RoutePath, state?: Record<string, unknown>) => {
    setCurrentRoute(path);
    setRouteState(state || null);
    if (typeof window !== 'undefined') {
      window.history.pushState(state || {}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Protected route enforcement
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = currentRoute === '/login' || currentRoute === '/signup';

    if (!user && !isPublicRoute) {
      // Redirect unauthenticated user to /login
      navigate('/login');
    } else if (user && isPublicRoute) {
      // Authenticated users shouldn't stay on login/signup
      navigate('/dashboard');
    }
  }, [user, loading, currentRoute]);

  const login = () => {
    navigate('/dashboard');
  };

  const logout = async () => {
    await authLogout();
    navigate('/login');
  };

  return (
    <RouterContext.Provider
      value={{
        currentRoute,
        navigate,
        routeState,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export const Link: React.FC<{
  to: RoutePath;
  className?: string;
  children: React.ReactNode;
  state?: Record<string, unknown>;
  id?: string;
}> = ({ to, className = '', children, state, id }) => {
  const { navigate, currentRoute } = useRouter();
  const isActive = currentRoute === to;

  return (
    <a
      id={id}
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to, state);
      }}
      className={`${className} ${isActive ? 'active' : ''}`}
    >
      {children}
    </a>
  );
};

