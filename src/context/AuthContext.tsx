import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (name: string, password?: string) => boolean;
  register: (name: string, password?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem('ecovoice_session');
    if (sessionStr) {
      setUser(JSON.parse(sessionStr));
      setIsAuthenticated(true);
    }
  }, []);

  const getUsers = () => {
    const usersStr = localStorage.getItem('ecovoice_users');
    return usersStr ? JSON.parse(usersStr) : {};
  };

  const saveUsers = (users: any) => {
    localStorage.setItem('ecovoice_users', JSON.stringify(users));
  };

  const register = (name: string, password?: string): boolean => {
    const users = getUsers();
    if (users[name]) {
      return false; // User already exists
    }
    const newUser = { name, password, joinedAt: new Date().toISOString() };
    users[name] = newUser;
    saveUsers(users);
    
    // Auto login
    localStorage.setItem('ecovoice_session', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const login = (name: string, password?: string): boolean => {
    const users = getUsers();
    const existingUser = users[name];
    
    if (existingUser && existingUser.password === password) {
      localStorage.setItem('ecovoice_session', JSON.stringify(existingUser));
      setUser(existingUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('ecovoice_session');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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
