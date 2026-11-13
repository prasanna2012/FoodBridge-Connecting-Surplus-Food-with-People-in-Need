import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('foodbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('foodbridge_token'));
  const [loading, setLoading] = useState(true);

  // Sync current user profile from server
  const refreshUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      localStorage.setItem('foodbridge_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, ...userData } = res.data;
    localStorage.setItem('foodbridge_token', access_token);
    setToken(access_token);
    // Fetch full profile
    const profileRes = await authApi.getMe();
    setUser(profileRes.data);
    localStorage.setItem('foodbridge_user', JSON.stringify(profileRes.data));
    return profileRes.data;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isVerified: user?.is_verified || false,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

