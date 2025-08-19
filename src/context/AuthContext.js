// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Check localStorage first (persistent tokens)
    const localToken = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (localToken) {
      // Check if localStorage token is expired
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenPersistent');
        localStorage.removeItem('tokenExpiry');
      } else {
        return localToken;
      }
    }
    
    // Check sessionStorage (session-only tokens)
    const sessionToken = sessionStorage.getItem('token');
    const sessionExpiry = sessionStorage.getItem('sessionExpiry');
    
    if (sessionToken) {
      // Check if session token is expired
      if (sessionExpiry && Date.now() > parseInt(sessionExpiry)) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('sessionExpiry');
      } else {
        return sessionToken;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set axios default header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          setLoading(true);
          const res = await axios.get(API_ENDPOINTS.ME);
          
          if (res.data.status === 'success') {
            setUser(res.data.data.user);
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (err) {
          // Clear invalid token
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        // No token found - set initialized to true so app can proceed
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, [token]);

  // Listen for storage changes to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token was added in another tab
          setToken(e.newValue);
        } else {
          // Token was removed in another tab
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    };

    // Listen for storage events (cross-tab synchronization for localStorage only)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Cross-tab sync (only works for localStorage, not sessionStorage)
  useEffect(() => {
    const syncTokenAcrossTabs = () => {
      // Check localStorage first (cross-tab sync possible)
      const localToken = localStorage.getItem('token');
      const localExpiry = localStorage.getItem('tokenExpiry');
      
      if (localToken && (!localExpiry || Date.now() <= parseInt(localExpiry))) {
        if (localToken !== token) {
          setToken(localToken);
        }
        return;
      }
      
      // If no valid localStorage token and current token exists, it might be sessionStorage
      // SessionStorage can't be synced across tabs by design (security feature)
      if (!localToken && token) {
        // Check if current token is from sessionStorage
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken === token) {
          return;
        }
      }
      
      // No valid token found, clear current token
      if (localToken !== token) {
        setToken(null);
      }
    };

    // Use broadcast channel for real-time cross-tab communication
    const broadcastChannel = new BroadcastChannel('auth_sync');
    
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'AUTH_STATE_CHANGE') {
        syncTokenAcrossTabs();
      }
    };

    return () => {
      broadcastChannel.close();
    };
  }, [token]);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      });

      if (res.data.status === 'success') {
        const { token: newToken, data: { user: userData } } = res.data;
        
        setToken(newToken);
        setUser(userData);
        
        // Store token with security considerations
        if (rememberMe) {
          // Persistent login: use localStorage for cross-tab experience
          localStorage.setItem('token', newToken);
          localStorage.setItem('tokenPersistent', 'true');
          sessionStorage.removeItem('token');
          // Set expiration for security (30 days)
          const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        } else {
          // Session-only login: use sessionStorage for better security
          sessionStorage.setItem('token', newToken);
          localStorage.removeItem('token');
          localStorage.removeItem('tokenPersistent');
          localStorage.removeItem('tokenExpiry');
          // Set session expiry (8 hours)
          const sessionExpiry = Date.now() + (8 * 60 * 60 * 1000);
          sessionStorage.setItem('sessionExpiry', sessionExpiry.toString());
        }
        
        // Notify other tabs of auth state change
        try {
          const broadcastChannel = new BroadcastChannel('auth_sync');
          broadcastChannel.postMessage({ type: 'AUTH_STATE_CHANGE', action: 'LOGIN' });
          broadcastChannel.close();
        } catch (error) {
          // Broadcast failed - continue silently
        }
        
        return userData;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.validationErrors?.length > 0) {
          errorMessage = err.response.data.validationErrors.map(e => e.msg).join(', ');
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (token, userData, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      setToken(token);
      setUser(userData);
      
      // Store token with security considerations
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenPersistent', 'true');
        sessionStorage.removeItem('token');
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenPersistent');
        localStorage.removeItem('tokenExpiry');
        const sessionExpiry = Date.now() + (8 * 60 * 60 * 1000);
        sessionStorage.setItem('sessionExpiry', sessionExpiry.toString());
      }
      
      // Notify other tabs of auth state change
      try {
        const broadcastChannel = new BroadcastChannel('auth_sync');
        broadcastChannel.postMessage({ type: 'AUTH_STATE_CHANGE', action: 'SOCIAL_LOGIN' });
        broadcastChannel.close();
      } catch (error) {
        // Broadcast failed - continue silently
      }
      return userData;
    } catch (err) {
      setError('Social login failed. Please try again.');
      throw new Error('Social login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.SIGNUP, {
        name,
        email,
        password,
        passwordConfirm: password
      });

      if (res.data.status === 'success') {
        // Registration successful - user needs to verify email
        return {
          success: true,
          message: res.data.message || 'Registration successful! Please check your email to verify your account.'
        };
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      // Registration error handled above
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.validationErrors?.length > 0) {
          errorMessage = err.response.data.validationErrors.map(e => e.msg).join(', ');
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email
      });

      if (res.data.status === 'success') {
        return {
          success: true,
          message: res.data.message || 'Password reset link sent to your email!'
        };
      } else {
        throw new Error(res.data.message || 'Failed to send reset email');
      }
    } catch (err) {
      // Forgot password error handled above
      const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password, passwordConfirm) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.patch(`${API_ENDPOINTS.RESET_PASSWORD}/${token}`, {
        password,
        passwordConfirm
      });

      if (res.data.status === 'success') {
        const { token: newToken, data: { user: userData } } = res.data;
        
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        
        return {
          success: true,
          message: 'Password reset successful! You are now logged in.'
        };
      } else {
        throw new Error(res.data.message || 'Password reset failed');
      }
    } catch (err) {
      // Reset password error handled above
      const errorMessage = err.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword, passwordConfirm) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.patch(API_ENDPOINTS.UPDATE_PASSWORD, {
        passwordCurrent: currentPassword,
        password: newPassword,
        passwordConfirm
      });

      if (res.data.status === 'success') {
        const { token: newToken, data: { user: userData } } = res.data;
        
        setToken(newToken);
        setUser(userData);
        
        // Update stored token
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', newToken);
        } else {
          sessionStorage.setItem('token', newToken);
        }
        
        return {
          success: true,
          message: 'Password updated successfully!'
        };
      } else {
        throw new Error(res.data.message || 'Password update failed');
      }
    } catch (err) {
      // Update password error handled above
      const errorMessage = err.response?.data?.message || 'Password update failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(API_ENDPOINTS.RESEND_VERIFICATION, {
        email
      });

      if (res.data.status === 'success') {
        return {
          success: true,
          message: res.data.message || 'Verification email sent!'
        };
      } else {
        throw new Error(res.data.message || 'Failed to send verification email');
      }
    } catch (err) {
      // Resend verification error handled above
      const errorMessage = err.response?.data?.message || 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate server-side session
      await axios.post(API_ENDPOINTS.LOGOUT);
    } catch (err) {
      // Don't throw error for logout - clear local state anyway
    } finally {
      // Clear local state
      setUser(null);
      setToken(null);
      setError(null);
      
      // Clear all auth-related storage
      localStorage.removeItem('token');
      localStorage.removeItem('tokenPersistent');
      localStorage.removeItem('tokenExpiry');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('sessionExpiry');
      sessionStorage.removeItem('sessionActive');
      
      delete axios.defaults.headers.common['Authorization'];
      
      // Notify other tabs of logout
      try {
        const broadcastChannel = new BroadcastChannel('auth_sync');
        broadcastChannel.postMessage({ type: 'AUTH_STATE_CHANGE', action: 'LOGOUT' });
        broadcastChannel.close();
      } catch (error) {
        // Broadcast failed - continue silently
      }
    }
  }, []);

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const value = {
    user,
    token,
    loading,
    error,
    isInitialized,
    login,
    socialLogin,
    register,
    logout,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    updatePassword,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
