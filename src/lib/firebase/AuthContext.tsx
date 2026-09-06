import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config';
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logoutUser,
  formatAuthError,
} from './auth';
import { getUserProfile, createUserProfile } from '@/src/services/users';
import { getBusiness, createBusiness, getUserBusiness } from '@/src/services/businesses';
import { UserProfile, Business } from '@/src/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  business: Business | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  signup: (
    email: string,
    pass: string,
    displayName: string,
    businessName?: string,
    industry?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfileAndBusiness: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  business: null,
  loading: true,
  login: async () => {},
  loginGoogle: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshProfileAndBusiness: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = async (currentUser: FirebaseUser) => {
    try {
      let profile = await getUserProfile(currentUser.uid);

      if (!profile) {
        // Auto-provision default profile & workspace if newly created or first-time
        const now = new Date().toISOString();
        const bizId = `biz_${currentUser.uid.slice(0, 10)}`;
        const defaultBiz: Business = {
          id: bizId,
          name: 'NovaMart Electronics',
          industry: 'Retail / Electronics',
          ownerId: currentUser.uid,
          createdAt: now,
        };
        await createBusiness(defaultBiz);

        profile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Store Manager',
          businessId: bizId,
          createdAt: now,
        };
        await createUserProfile(profile);
        setBusiness(defaultBiz);
        setUserProfile(profile);
        return;
      }

      setUserProfile(profile);

      // Load associated business workspace
      if (profile.businessId) {
        const biz = await getBusiness(profile.businessId);
        if (biz) {
          setBusiness(biz);
        } else {
          // Check by ownerId
          const ownedBiz = await getUserBusiness(currentUser.uid);
          setBusiness(ownedBiz);
        }
      }
    } catch (err) {
      console.error('Error loading user profile or business:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setUserProfile(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const loggedUser = await loginWithEmail(email, pass);
      await loadUserData(loggedUser);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      await loadUserData(loggedUser);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    pass: string,
    displayName: string,
    businessName?: string,
    industry?: string
  ) => {
    setLoading(true);
    try {
      const res = await registerWithEmail(
        email,
        pass,
        displayName,
        businessName,
        industry
      );
      setUser(res.user);
      setUserProfile(res.userProfile);
      setBusiness(res.business);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfileAndBusiness = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        business,
        loading,
        login,
        loginGoogle,
        signup,
        logout,
        refreshProfileAndBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
