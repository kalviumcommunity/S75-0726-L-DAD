import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { authApi, type User } from '../../services/api/auth.service';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  // Check for existing token and validate it on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

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
