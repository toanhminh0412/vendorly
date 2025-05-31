'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch {
          // Token is invalid, remove it
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { access_token, refresh_token, user: userData } = response;
    
    Cookies.set('access_token', access_token, { expires: 1 });
    Cookies.set('refresh_token', refresh_token, { expires: 7 });
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    await authAPI.register(data);
    // Don't auto-login after registration, user needs to verify email
  };

  const logout = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
    }
  };

  const refreshAuth = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch {
      await logout();
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}