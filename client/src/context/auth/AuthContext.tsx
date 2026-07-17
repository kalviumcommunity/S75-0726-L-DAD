import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type User = {
  name: string;
  role: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const defaultUser: User = {
  name: 'Alicia Chen',
  role: 'Logistics Operations',
  email: 'alicia@ldad.example'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user: defaultUser,
      login,
      logout
    }),
    [isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
