'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { IUser, ApiResponse, LoginRequest } from '@/types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ 
    success: boolean; 
    message: string; 
    requiresTwoFactor?: boolean;
  }>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message: string; errors?: any[] }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; errors?: any[] }>;
  setupTwoFactor: (pin: string) => Promise<{ success: boolean; message: string }>;
  disableTwoFactor: () => Promise<{ success: boolean; message: string }>;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
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

const PERMISSIONS = {
  super_admin: ['users:read', 'users:write', 'users:delete', 'routes:read', 'routes:write', 'routes:delete', 'buses:read', 'buses:write', 'buses:delete', 'bookings:read', 'bookings:write', 'bookings:delete'],
  admin: ['routes:read', 'routes:write', 'routes:delete', 'buses:read', 'buses:write', 'buses:delete', 'bookings:read', 'bookings:write', 'bookings:delete'],
  manager: ['bookings:read', 'bookings:write', 'bookings:delete']
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: ApiResponse<{ user: IUser }> = await response.json();
        if (data.success && data.data) {
          setUser(data.data.user);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const loginData: LoginRequest = { email, password };
      if (twoFactorCode) {
        loginData.twoFactorCode = twoFactorCode;
      }

      console.log('🚀 Frontend login attempt:', { 
        email, 
        hasTwoFactorCode: !!twoFactorCode,
        twoFactorCodeLength: twoFactorCode?.length || 0
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const data: ApiResponse<{ token: string; user: IUser; requiresTwoFactor?: boolean }> = await response.json();

      console.log('📡 Login response:', { 
        success: data.success, 
        message: data.message,
        hasData: !!data.data,
        requiresTwoFactor: data.data?.requiresTwoFactor,
        responseStatus: response.status
      });

      // Check if 2FA is required (this can come in data even when success is false)
      if (data.data?.requiresTwoFactor) {
        console.log('🔒 Two-factor authentication required');
        return { 
          success: false, 
          message: data.message, 
          requiresTwoFactor: true 
        };
      }

      // Check if login was successful
      if (data.success && data.data?.user) {
        console.log('✅ Login successful for user:', data.data.user.email);
        setUser(data.data.user);

        // Redirect based on role
        const dashboardRoute = `/dashboard/${data.data.user.role.replace('_', '-')}`;
        console.log('🚀 Redirecting to:', dashboardRoute);
        router.push(dashboardRoute);

        return { success: true, message: data.message };
      } else {
        console.log('❌ Login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('💥 Frontend login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      const data: ApiResponse<{ user: IUser }> = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data: ApiResponse = await response.json();
      return { success: data.success, message: data.message, errors: data.errors };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const setupTwoFactor = async (pin: string) => {
    try {
      const response = await fetch('/api/auth/two-factor/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ pin })
      });

      const data: ApiResponse = await response.json();
      
      if (data.success && user) {
        setUser({ ...user, twoFactorEnabled: true });
      }

      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Setup two-factor error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const disableTwoFactor = async () => {
    try {
      const response = await fetch('/api/auth/two-factor/disable', {
        method: 'POST',
        credentials: 'include'
      });

      const data: ApiResponse = await response.json();
      
      if (data.success && user) {
        setUser({ ...user, twoFactorEnabled: false });
      }

      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Disable two-factor error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = PERMISSIONS[user.role as keyof typeof PERMISSIONS] || [];
    return userPermissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    setupTwoFactor,
    disableTwoFactor,
    isAuthenticated,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};