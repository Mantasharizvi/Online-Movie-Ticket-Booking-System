'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  admin: User | null;
  token: string | null;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user token
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === 'user') {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          // If it was an admin in the user slot, clear it to force clean separation
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Check for stored admin token separately
    const sAdminToken = localStorage.getItem('adminToken');
    const sAdminUser = localStorage.getItem('adminUser');
    if (sAdminToken && sAdminUser) {
      try {
        const parsedAdmin = JSON.parse(sAdminUser);
        if (parsedAdmin.role === 'admin') {
          setAdminToken(sAdminToken);
          setAdmin(parsedAdmin);
        } else {
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
        }
      } catch (e) {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'admin') {
          setAdminToken(data.token);
          setAdmin(data.user);
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          router.push('/admin');
        } else {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await login(email, password);
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    // If we're on an admin page, logout admin only, else logout user only
    const isAdminPath = window.location.pathname.startsWith('/admin');
    
    if (isAdminPath) {
      setAdminToken(null);
      setAdmin(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, admin, token, adminToken, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
