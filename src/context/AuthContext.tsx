import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  token: string | null;
  login: (token: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Try to load from localStorage initially
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  
  const isLoggedIn = !!token;

  const login = (newToken: string, newUserName: string) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userName', newUserName);
    setToken(newToken);
    setUserName(newUserName);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setToken(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, token, login, logout }}>
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
