import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { userApi } from '../services/userApi';
import { showToast } from '../components/ToastContainer';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User> & { password?: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('evan_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.token) {
      userApi
        .getProfile()
        .then((profile) => {
          setUser((prev) => (prev ? { ...prev, ...profile } : null));
        })
        .catch(() => {});
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('evan_user', JSON.stringify(response.data));
      showToast(`Welcome back, ${response.data.name}!`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      setUser(response.data);
      localStorage.setItem('evan_user', JSON.stringify(response.data));
      showToast(`Account created successfully! Welcome, ${response.data.name}.`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData: Partial<User> & { password?: string }) => {
    setLoading(true);
    try {
      const updated = await userApi.updateProfile(updatedData);
      setUser((prev) => (prev ? { ...prev, ...updated } : null));
      const currentSaved = localStorage.getItem('evan_user');
      if (currentSaved) {
        const parsed = JSON.parse(currentSaved);
        localStorage.setItem('evan_user', JSON.stringify({ ...parsed, ...updated }));
      }
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('evan_user');
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, error }}>
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
