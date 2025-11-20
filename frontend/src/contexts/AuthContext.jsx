import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          
          // Verify token is still valid
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { 
        success: false, 
        error: message,
        errors: error.response?.data?.errors 
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await authAPI.register(email, password, name);
      const { user, accessToken, refreshToken } = response.data;

      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { 
        success: false, 
        error: message,
        errors: error.response?.data?.errors 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
