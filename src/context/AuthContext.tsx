import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import apiRequest from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    nationality?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/api/v1/auth/me');
      if (res.success && res.user) {
        if (res.token) {
          try {
            localStorage.setItem('auravisa_auth_token', res.token);
          } catch {}
        }
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.user) {
      if (res.token) {
        try {
          localStorage.setItem('auravisa_auth_token', res.token);
        } catch {}
      }
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Login failed.' };
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    nationality?: string;
  }) => {
    const res = await apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.user) {
      if (res.token) {
        try {
          localStorage.setItem('auravisa_auth_token', res.token);
        } catch {}
      }
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const logout = async () => {
    try {
      try {
        localStorage.removeItem('auravisa_auth_token');
      } catch {}
      await apiRequest('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
