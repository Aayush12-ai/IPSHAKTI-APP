import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarInitials: string;
  organization?: string;
  badge?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (id: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'ip_sakti_auth_user_v1';

const DEFAULT_USER: UserProfile = {
  id: '123',
  name: 'Aayush Jaiswal',
  role: 'Registered Innovator · India AYUSH',
  email: 'innovator123@ipsakti.gov.in',
  avatarInitials: 'AJ',
  organization: 'Ayurvedic IP & Regulatory Intelligence Unit',
  badge: 'Innovator Tier 1',
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserProfile;
          setUser(parsed);
        }
      } catch (err) {
        console.error('Failed to load auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (id: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = id.trim();
    const cleanPass = pass.trim();

    // Check credentials: ID = 123, Password = 123
    if (cleanId === '123' && cleanPass === '123') {
      const activeUser = DEFAULT_USER;
      setUser(activeUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(activeUser));
      return { success: true };
    }

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both User ID and Password.' };
    }

    return {
      success: false,
      error: 'Invalid credentials. Currently active credentials: ID is 123 and Password is 123.',
    };
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear auth session:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
