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

const TOKEN_KEY = 'better-auth.session_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function storeToken(data: any) {
  const token = data?.token || data?.session?.token;
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        return;
      }

      const res = await authApi.getMe();
      setUser(res?.user ?? null);
    } catch {
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

    if (res.error) throw new Error(res.error.message || 'Login failed');

    storeToken(res.data);
    await fetchUser();
  };

  const register = async (data: any) => {
    const res = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      image: data.avatar || 'avatar-01',
    } as any);

    if (res.error) throw new Error(res.error.message || 'Registration failed');

    storeToken(res.data);
    await fetchUser();
    return res.data;
  };

  const logout = async () => {
    try { await authClient.signOut(); } catch {}
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const isPro = Boolean(
    user?.subscription?.plan &&
      user.subscription.plan !== 'free' &&
      user.subscription.status === 'active',
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchUser, isPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
