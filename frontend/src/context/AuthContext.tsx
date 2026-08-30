import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../lib/auth-client.js';
import { authApi } from '../api/auth.js';
import type { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (_err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials: any) => {
    const res = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    });

    if (res.error) {
      throw new Error(res.error.message || 'Login failed');
    }

    if (res.data?.token) {
      localStorage.setItem('better-auth.session_token', res.data.token);
    }

    await fetchUser();
  };

  const register = async (data: any) => {
    const res = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      image: data.avatar || 'avatar-01',
    } as any);

    if (res.error) {
      throw new Error(res.error.message || 'Registration failed');
    }

    if (res.data?.token) {
      localStorage.setItem('better-auth.session_token', res.data.token);
    }

    await fetchUser();
    return res.data;
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (_) {}
    localStorage.removeItem('better-auth.session_token');
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const isPro = Boolean(
    user?.subscription?.plan &&
      user.subscription.plan !== 'free' &&
      user.subscription.status === 'active',
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchUser,
        isPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
