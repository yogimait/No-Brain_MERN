import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage first
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');

      if (userId && userEmail) {
        // Verify with backend
        try {
          const response = await authAPI.getCurrentUser();
          if (response && response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            // Update localStorage with latest data
            localStorage.setItem('userId', response.data._id);
            localStorage.setItem('userEmail', response.data.email);
            localStorage.setItem('userName', response.data.name);
          } else {
            // Fallback to localStorage data
            setUser({
              _id: userId,
              email: userEmail,
              name: userName
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          // If backend check fails (e.g., 401 Unauthorized), use localStorage as fallback
          // This is expected when session expires but user data is still in localStorage
          if (error.response?.status === 401) {
            // Session expired, but we can still use localStorage data
            if (userId && userEmail) {
              setUser({
                _id: userId,
                email: userEmail,
                name: userName
              });
              setIsAuthenticated(true);
            } else {
              clearAuth();
            }
          } else {
            // Other errors - log but still try localStorage fallback
            console.warn('Auth check error:', error.message);
            if (userId && userEmail) {
              setUser({
                _id: userId,
                email: userEmail,
                name: userName
              });
              setIsAuthenticated(true);
            } else {
              clearAuth();
            }
          }
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response && response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem('userId', userData._id);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (email, name, password) => {
    try {
      const response = await authAPI.register({ email, name, password });
      
      if (response && response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem('userId', userData._id);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  const getUserId = () => {
    return user?._id || localStorage.getItem('userId');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    getUserId
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

