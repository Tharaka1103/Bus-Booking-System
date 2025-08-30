'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { IUser, ApiResponse } from '@/types';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string; errors?: any[] }>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message: string; errors?: any[] }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; errors?: any[] }>;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Verify token is still valid
        verifyToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Verify token validity
  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data: ApiResponse<{ user: IUser }> = await response.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      logout();
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data: ApiResponse<{ token: string; user: IUser }> = await response.json();

      if (data.success && data.data) {
        const { token, user } = data.data;
        
        // Store in localStorage with expiration
        const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('authExpiration', expirationTime.toString());
        
        setToken(token);
        setUser(user);

        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data: ApiResponse<{ token: string; user: IUser }> = await response.json();

      if (data.success && data.data) {
        const { token, user } = data.data;
        
        // Store in localStorage
        const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('authExpiration', expirationTime.toString());
        
        setToken(token);
        setUser(user);

        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('authExpiration');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  // Update profile function
  const updateProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data: ApiResponse<{ user: IUser }> = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data: ApiResponse = await response.json();
      return { success: data.success, message: data.message, errors: data.errors };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    if (!token || !user) return false;
    
    const expirationTime = localStorage.getItem('authExpiration');
    if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
      logout();
      return false;
    }
    
    return true;
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};