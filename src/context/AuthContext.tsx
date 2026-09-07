import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

import API from '../services/api';
import { logoutUser } from '../services/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  token: string | null;
  login: (token: string, userName: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'));
  
  const isLoggedIn = !!token;

  const login = useCallback((newToken: string, newUserName: string) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userName', newUserName);
    setToken(newToken);
    setUserName(newUserName);
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    logoutUser();
    setToken(null);
    setUserName(null);
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    userName,
    token,
    login,
    logout
  }), [isLoggedIn, userName, token, login, logout]);

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
