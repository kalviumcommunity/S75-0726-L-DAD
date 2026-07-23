import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { authApi, type User } from '../../services/api/auth.service';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyTheme = (theme: 'light' | 'dark' | undefined) => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      setIsAuthenticated(true);
      applyTheme(userData.theme);
    } catch (err) {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Check for existing token and validate it on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    applyTheme(user?.theme);
  }, [user?.theme]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: userData } = await authApi.login(email, password);
      localStorage.setItem('authToken', token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    applyTheme('light');
  };

  const updateUser = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      applyTheme(nextUser.theme);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      updateUser,
      refreshUser,
      loading,
      error,
      clearError
    }),
    [isAuthenticated, user, loading, error]
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
