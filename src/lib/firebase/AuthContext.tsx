import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const isRegisteringRef = useRef<boolean>(false);

  const loadUserData = async (currentUser: FirebaseUser) => {
    try {
      let profile = await getUserProfile(currentUser.uid);

      if (!profile) {
        // If registration is currently in flight, allow registerWithEmail to create the records
        if (isRegisteringRef.current) {
          return;
        }

        // Check if an existing business is owned by this user
        const existingBiz = await getUserBusiness(currentUser.uid);
        const now = new Date().toISOString();
        const bizId = existingBiz?.id || `biz_${currentUser.uid.slice(0, 12)}`;

        let activeBiz = existingBiz;
        if (!activeBiz) {
          const defaultBiz: Business = {
            id: bizId,
            name: 'NovaMart Electronics',
            industry: 'Retail / Electronics',
            ownerId: currentUser.uid,
            createdAt: now,
          };
          await createBusiness(defaultBiz);
          activeBiz = defaultBiz;
        }

        profile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName:
            currentUser.displayName ||
            currentUser.email?.split('@')[0] ||
            'Store Manager',
          businessId: bizId,
          createdAt: now,
        };
        await createUserProfile(profile);
        setBusiness(activeBiz);
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
        if (!isRegisteringRef.current) {
          await loadUserData(currentUser);
        }
      } else {
        setUserProfile(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const loggedUser = await loginWithEmail(email, pass);
      setUser(loggedUser);
      await loadUserData(loggedUser);
    } catch (err) {
      throw err;
    }
  };

  const loginGoogle = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      await loadUserData(loggedUser);
    } catch (err) {
      throw err;
    }
  };

  const signup = async (
    email: string,
    pass: string,
    displayName: string,
    businessName?: string,
    industry?: string
  ) => {
    isRegisteringRef.current = true;
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
      isRegisteringRef.current = false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      setBusiness(null);
    } catch (err) {
      console.error('Error during logout:', err);
      throw err;
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
